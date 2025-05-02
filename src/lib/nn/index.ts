// Export all neural network modules

// Activation functions
export * from './activation';

// Layer implementation
export * from './layer';

// Network implementation
export * from './network';

// Data generation
export * from './data';

// Visualization
export * from './visualization';

// Main playground controller
import { NeuralNetwork, NetworkConfig, TrainingConfig } from './network';
import { generateData, generateGridData, splitTrainTest, GridData } from './data';
import { initializeVisualization, updateVisualization, VisualizationElements } from './visualization';
import { getActivation } from './activation';

export interface PlaygroundState {
    isTraining: boolean;
    currentEpoch: number;
    progress: number;
    network: NeuralNetwork | null;
    trainData: { X: number[][], Y: number[][] } | null;
    testData: { X: number[][], Y: number[][] } | null;
    gridData: GridData | null;
}

export class NNPlaygroundController {
    private state: PlaygroundState;
    private networkConfig: NetworkConfig;
    private trainingConfig: TrainingConfig;
    private dataConfig: {
        dataFunction: string;
        samples: number;
        testRatio: number;
        xRange: [number, number];
        yRange: [number, number];
    };
    private visualElements: VisualizationElements | null = null;
    private trainingPromise: Promise<any> | null = null;

    constructor() {
        this.state = {
            isTraining: false,
            currentEpoch: 0,
            progress: 0,
            network: null,
            trainData: null,
            testData: null,
            gridData: null
        };

        this.networkConfig = {
            inputDim: 2,
            hiddenDims: [10, 5],
            outputDim: 1,
            hiddenActivations: ['tanh', 'tanh'],
            outputActivation: 'linear',
            useBias: true
        };

        this.trainingConfig = {
            learningRate: 0.01,
            numEpochs: 1000,
            batchSize: 32,
            noise: 0.1
        };

        this.dataConfig = {
            dataFunction: 'saddle',
            samples: 1000,
            testRatio: 0.1,
            xRange: [-3, 3],
            yRange: [-3, 3]
        };
    }

    // Set visualization elements
    setVisualElements(elements: VisualizationElements): void {
        this.visualElements = elements;
    }

    // Update network configuration
    updateNetworkConfig(config: Partial<NetworkConfig>): void {
        this.networkConfig = { ...this.networkConfig, ...config };
    }

    // Update training configuration
    updateTrainingConfig(config: Partial<TrainingConfig>): void {
        this.trainingConfig = { ...this.trainingConfig, ...config };
    }

    // Update data configuration
    updateDataConfig(config: Partial<typeof this.dataConfig>): void {
        this.dataConfig = { ...this.dataConfig, ...config };
    }

    // Initialize the playground
    initialize(): void {
        try {
            // Generate data
            const data = generateData(
                this.dataConfig.dataFunction,
                this.dataConfig.samples,
                this.dataConfig.xRange,
                this.dataConfig.yRange,
                this.trainingConfig.noise
            );

            // Split into training and test sets
            const { trainData, testData } = splitTrainTest(data, this.dataConfig.testRatio);

            // Generate grid data for visualization
            const gridData = generateGridData(
                this.dataConfig.xRange,
                this.dataConfig.yRange,
                20 // grid size
            );

            // Create neural network
            const network = NeuralNetwork.fromConfig(this.networkConfig);

            // Store state
            this.state = {
                ...this.state,
                network,
                trainData,
                testData,
                gridData
            };

            // Initialize visualization if elements are available
            if (this.visualElements) {
                initializeVisualization(
                    this.visualElements,
                    trainData,
                    gridData,
                    this.dataConfig.dataFunction
                );
            }

            console.log('Neural network playground initialized.');
        } catch (error) {
            console.error('Failed to initialize neural network playground:', error);
        }
    }

    // Debug state
    debugState(): void {
        console.log('NNPlaygroundController state:', {
            isTraining: this.state.isTraining,
            currentEpoch: this.state.currentEpoch,
            progress: this.state.progress
        });
    }

    // Start training
    async startTraining(onEpochEnd?: (epoch: number, loss: number, progress: number) => void, startEpoch: number = 0): Promise<void> {
        if (!this.state.network || !this.state.trainData || this.state.isTraining) {
            console.error('Cannot start training: network not initialized or already training');
            return;
        }

        // Update state
        this.state.isTraining = true;

        if (startEpoch === 0) {
            // Only reset these if we're starting from the beginning
            this.state.currentEpoch = 0;
            this.state.progress = 0;
        }

        // Train network
        try {
            const handleEpochEnd = (epoch: number, loss: number, progress: number) => {
                this.state.currentEpoch = epoch;
                this.state.progress = progress;

                // Generate current predictions for the visualization grid
                if (this.state.network && this.state.gridData) {
                    // Always generate fresh predictions from the current network state
                    const currentPredictions = this.state.network.predict(this.state.gridData.gridPoints);

                    // Get the network history
                    const history = this.state.network.getHistory();

                    // Store grid predictions at a reasonable frequency to avoid overwhelming memory
                    // and to provide enough data points for smooth visualization
                    const updateFrequency = Math.max(1, Math.floor(this.trainingConfig.numEpochs / 50));

                    if (epoch % updateFrequency === 0 ||
                        epoch === this.trainingConfig.numEpochs - 1 ||
                        epoch < 10) { // Store more frequently in the beginning for better early visualization

                        // Check if this epoch already exists in history
                        const existingIndex = history.epochs.indexOf(epoch);

                        if (existingIndex >= 0) {
                            // Update existing prediction
                            history.predictions[existingIndex] = currentPredictions;
                        } else {
                            // Add new prediction
                            history.epochs.push(epoch);
                            history.predictions.push(currentPredictions);

                            // Log for debugging
                            console.log(`Added predictions for epoch ${epoch}, history size: ${history.epochs.length}`);
                        }
                    }

                    // Update visualization with the latest data
                    if (this.visualElements) {
                        updateVisualization(
                            this.visualElements,
                            history,
                            this.state.gridData,
                            epoch,
                            this.trainingConfig.numEpochs
                        );
                    }
                }

                // Call user callback
                if (onEpochEnd) {
                    onEpochEnd(epoch, loss, progress);
                }
            };

            // Create a function to check if training should continue
            const shouldContinueTraining = () => {
                return this.state.isTraining;
            };

            // Start training
            this.trainingPromise = this.state.network.train(
                this.state.trainData.X,
                this.state.trainData.Y,
                {
                    ...this.trainingConfig,
                    startEpoch: startEpoch // Pass the starting epoch
                },
                handleEpochEnd,
                this.state.testData || undefined, // Handle the null case properly
                shouldContinueTraining // Pass the function to check if training should continue
            );

            // Wait for training to complete
            await this.trainingPromise;

            // Update state
            this.state.isTraining = false;
            this.trainingPromise = null;
        } catch (error) {
            console.error('Training failed:', error);
            this.state.isTraining = false;
            this.trainingPromise = null;
        }
    }

    // Reset the playground
    reset(): void {
        // Stop training if in progress
        this.state.isTraining = false;
        this.state.currentEpoch = 0;
        this.state.progress = 0;

        // Cancel any pending training promise
        if (this.trainingPromise !== null) {
            // We can't actually cancel the promise, but we can signal through state
            // that it should stop processing. The network.train method should check
            // this.state.isTraining and stop if it's false
            this.trainingPromise = null;
        }

        // Re-initialize
        this.initialize();
    }

    // Get current state
    getState(): PlaygroundState {
        return { ...this.state };
    }
}

export default {
    NeuralNetwork,
    NNPlaygroundController
}; 