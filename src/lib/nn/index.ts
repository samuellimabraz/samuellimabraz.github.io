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

// Weight initialization strategies
export * from './initializers';

// Optimizers
export * from './optimizers';

// Main playground controller
import { NeuralNetwork, NetworkConfig, TrainingConfig } from './network';
import { generateData, generateGridData, splitTrainTest, GridData, StandardScaler } from './data';
import { initializeVisualization, updateVisualization, VisualizationElements } from './visualization';
import { getActivation } from './activation';
import { getInitializer } from './initializers';
import { getOptimizer } from './optimizers';

export interface PlaygroundState {
    isTraining: boolean;
    currentEpoch: number;
    progress: number;
    network: NeuralNetwork | null;
    trainData: { X: number[][], Y: number[][] } | null;
    testData: { X: number[][], Y: number[][] } | null;
    gridData: GridData | null;
    useNormalization: boolean;
    scaler: StandardScaler | null;
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
        useNormalization: boolean;
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
            gridData: null,
            useNormalization: false,
            scaler: null
        };

        this.networkConfig = {
            inputDim: 2,
            hiddenDims: [10, 5],
            outputDim: 1,
            hiddenActivations: ['tanh', 'tanh'],
            outputActivation: 'linear',
            useBias: true,
            weightInitializer: 'he',
            layerInitializers: ['he', 'he', 'he'], // Default initializers for each layer
            optimizer: 'adam'
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
            yRange: [-3, 3],
            useNormalization: false
        };
    }

    // Set visualization elements
    setVisualElements(elements: VisualizationElements): void {
        this.visualElements = elements;
    }

    // Update network configuration
    updateNetworkConfig(config: Partial<NetworkConfig>): void {
        // Special handling for layer-specific configuration changes
        if (config.hiddenDims && (!this.networkConfig.layerInitializers ||
            config.hiddenDims.length !== this.networkConfig.hiddenDims.length)) {
            // When changing layer dimensions, ensure layer initializers array matches
            const newLayerCount = config.hiddenDims.length + 1; // +1 for output layer
            const currentInitializers = this.networkConfig.layerInitializers || [];
            const defaultInitializer = this.networkConfig.weightInitializer || 'he';

            // Resize initializers array, preserving existing values where possible
            const newInitializers = Array(newLayerCount).fill(defaultInitializer)
                .map((defaultVal, i) => i < currentInitializers.length ? currentInitializers[i] : defaultVal);

            config.layerInitializers = newInitializers;
        }

        this.networkConfig = { ...this.networkConfig, ...config };
    }

    // Update training configuration
    updateTrainingConfig(config: Partial<TrainingConfig>): void {
        this.trainingConfig = { ...this.trainingConfig, ...config };
    }

    // Update data configuration
    updateDataConfig(config: Partial<typeof this.dataConfig>): void {
        this.dataConfig = { ...this.dataConfig, ...config };

        // If normalization setting changed, we need to update the state
        if (config.useNormalization !== undefined) {
            this.state.useNormalization = config.useNormalization;
        }
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

            // Initialize or reset the scaler
            const scaler = new StandardScaler();

            let normalizedTrainData = { ...trainData };
            let normalizedTestData = { ...testData };
            let normalizedGridPoints = [...gridData.gridPoints];

            // Apply normalization if enabled
            if (this.dataConfig.useNormalization) {
                // Fit the scaler on training data
                scaler.fit(trainData.X, trainData.Y);

                // Transform the data
                normalizedTrainData = {
                    X: scaler.transformX(trainData.X),
                    Y: scaler.transformY(trainData.Y)
                };

                normalizedTestData = {
                    X: scaler.transformX(testData.X),
                    Y: scaler.transformY(testData.Y)
                };

                // Transform grid points for prediction (but keep original for visualization)
                normalizedGridPoints = scaler.transformX(gridData.gridPoints);
            }

            // Create neural network
            const network = NeuralNetwork.fromConfig(this.networkConfig);

            // Store state
            this.state = {
                ...this.state,
                network,
                trainData: normalizedTrainData,
                testData: normalizedTestData,
                gridData: {
                    ...gridData,
                    // Store normalized grid points for prediction if normalization is enabled
                    gridPoints: this.dataConfig.useNormalization ? normalizedGridPoints : gridData.gridPoints
                },
                useNormalization: this.dataConfig.useNormalization,
                scaler: this.dataConfig.useNormalization ? scaler : null
            };

            // Initialize visualization if elements are available
            if (this.visualElements) {
                // For visualization, we always use the original (non-normalized) data
                initializeVisualization(
                    this.visualElements,
                    trainData, // Use original training data for visualization
                    gridData,  // Use original grid data for visualization
                    this.dataConfig.dataFunction
                );
            }

            console.log('Neural network playground initialized with normalization:', this.dataConfig.useNormalization);
        } catch (error) {
            console.error('Failed to initialize neural network playground:', error);
        }
    }

    // Debug state
    debugState(): void {
        console.log('NNPlaygroundController state:', {
            isTraining: this.state.isTraining,
            currentEpoch: this.state.currentEpoch,
            progress: this.state.progress,
            useNormalization: this.state.useNormalization
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
                    let currentPredictions = this.state.network.predict(this.state.gridData.gridPoints);

                    // Denormalize predictions if normalization is enabled
                    currentPredictions = this.denormalizePredictions(currentPredictions);

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

            await this.trainingPromise;

            // Ensure we update state once training is complete
            this.state.isTraining = false;
        } catch (error) {
            console.error('Training error:', error);
            this.state.isTraining = false;
        }
    }

    // Reset the playground
    reset(): void {
        // Cancel any ongoing training
        this.state.isTraining = false;

        // Re-initialize the playground
        this.initialize();
    }

    // Change global weight initializer
    setWeightInitializer(initializer: string): void {
        this.networkConfig.weightInitializer = initializer;
        if (this.state.network) {
            this.state.network.reinitializeWeights(initializer);
        }
    }

    // Change weight initializer for a specific layer
    setLayerInitializer(layerIndex: number, initializer: string): void {
        // Ensure we have a valid layerInitializers array
        if (!this.networkConfig.layerInitializers) {
            this.networkConfig.layerInitializers = Array(this.networkConfig.hiddenDims.length + 1)
                .fill(this.networkConfig.weightInitializer || 'he');
        }

        // Make sure layerInitializers array is properly sized
        while (this.networkConfig.layerInitializers.length <= this.networkConfig.hiddenDims.length) {
            this.networkConfig.layerInitializers.push(this.networkConfig.weightInitializer || 'he');
        }

        // Update the specific layer initializer
        if (layerIndex >= 0 && layerIndex <= this.networkConfig.hiddenDims.length) {
            this.networkConfig.layerInitializers[layerIndex] = initializer;

            // Apply the change to the network
            if (this.state.network) {
                this.state.network.setLayerInitializer(layerIndex, initializer);
            }
        }
    }

    // Change optimizer
    setOptimizer(optimizer: string): void {
        this.networkConfig.optimizer = optimizer;
        if (this.state.network) {
            this.state.network.setOptimizer(optimizer, {
                learningRate: this.trainingConfig.learningRate
            });
        }
    }

    // Set whether to use data normalization
    setUseNormalization(useNormalization: boolean): void {
        if (this.dataConfig.useNormalization !== useNormalization) {
            this.dataConfig.useNormalization = useNormalization;
            this.state.useNormalization = useNormalization;

            // Re-initialize the data with or without normalization
            this.reset();
        }
    }

    // Helper method to denormalize predictions if needed
    denormalizePredictions(predictions: number[][]): number[][] {
        if (this.state.useNormalization && this.state.scaler) {
            return this.state.scaler.inverseTransformY(predictions);
        }
        return predictions;
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