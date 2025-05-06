export * from './activation';
export * from './layer';
export * from './network';
export * from './data';
export * from './visualization';
export * from './initializers';
export * from './optimizers';

import { NeuralNetwork, NetworkConfig, TrainingConfig, TrainingHistory } from './network';
import { generateData, generateGridData, splitTrainTest, GridData, StandardScaler } from './data';
import { initializeVisualization, updateVisualization, VisualizationElements } from './visualization';

/**
 * Interface for tracking the current state of the neural network playground
 */
export interface PlaygroundState {
    isTraining: boolean;
    currentEpoch: number;
    progress: number;
    network: NeuralNetwork | null;
    trainData: { X: number[][], Y: number[][] } | null;
    testData: { X: number[][], Y: number[][] } | null;
    gridData: GridData | null;
    normalizedGridPointsForPred: number[][] | null;
    useNormalization: boolean;
    scaler: StandardScaler | null;
}

/**
 * Controller class for the neural network playground
 * Manages network configuration, training, and visualization
 */
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
    private trainingStopSignal: (() => boolean) | null = null;
    private currentTrainingPromise: Promise<TrainingHistory> | null = null;

    /**
     * Create a new playground controller with default settings
     */
    constructor() {
        this.state = {
            isTraining: false,
            currentEpoch: 0,
            progress: 0,
            network: null,
            trainData: null,
            testData: null,
            gridData: null,
            normalizedGridPointsForPred: null,
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
            layerInitializers: ['he', 'he', 'he'],
            optimizer: 'adam',
            loss: 'mse'
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

    /**
     * Set visualization DOM elements
     * @param elements Object containing visualization DOM elements
     */
    setVisualElements(elements: VisualizationElements): void {
        this.visualElements = elements;
    }

    /**
     * Update network configuration
     * @param config Partial network configuration to update
     */
    updateNetworkConfig(config: Partial<NetworkConfig>): void {
        const oldHiddenDimsLength = this.networkConfig.hiddenDims.length;
        this.networkConfig = { ...this.networkConfig, ...config, loss: 'mse' };

        if (config.hiddenDims && config.hiddenDims.length !== oldHiddenDimsLength) {
            const newLayerCount = this.networkConfig.hiddenDims.length + 1;
            const currentInitializers = this.networkConfig.layerInitializers || [];
            const defaultInitializer = this.networkConfig.weightInitializer || 'he';
            this.networkConfig.layerInitializers = Array(newLayerCount).fill(defaultInitializer)
                .map((val, i) => currentInitializers[i] || val);
        }
    }

    /**
     * Update training configuration
     * @param config Partial training configuration to update
     */
    updateTrainingConfig(config: Partial<TrainingConfig>): void {
        this.trainingConfig = { ...this.trainingConfig, ...config };
    }

    /**
     * Update data generation configuration
     * @param config Partial data configuration to update
     */
    updateDataConfig(config: Partial<typeof this.dataConfig>): void {
        this.dataConfig = { ...this.dataConfig, ...config };
        if (config.useNormalization !== undefined) {
            this.state.useNormalization = config.useNormalization;
        }
    }

    /**
     * Initialize the playground with current configurations
     * Generates data, creates network, and prepares visualization
     */
    initialize(): void {
        try {
            const rawData = generateData(
                this.dataConfig.dataFunction,
                this.dataConfig.samples,
                this.dataConfig.xRange,
                this.dataConfig.yRange,
                this.trainingConfig.noise
            );
            const { trainData: rawTrainData, testData: rawTestData } = splitTrainTest(rawData, this.dataConfig.testRatio);

            const gridData = generateGridData(this.dataConfig.xRange, this.dataConfig.yRange, 20);
            this.state.gridData = gridData;

            const scaler = new StandardScaler();
            let currentTrainData = rawTrainData;
            let currentTestData = rawTestData;
            let gridPointsForPred = gridData.gridPoints;

            if (this.dataConfig.useNormalization) {
                scaler.fit(rawTrainData.X, rawTrainData.Y);
                currentTrainData = { X: scaler.transformX(rawTrainData.X), Y: scaler.transformY(rawTrainData.Y) };
                currentTestData = { X: scaler.transformX(rawTestData.X), Y: scaler.transformY(rawTestData.Y) };
                gridPointsForPred = scaler.transformX(gridData.gridPoints);
                this.state.scaler = scaler;
            } else {
                this.state.scaler = null;
            }
            this.state.normalizedGridPointsForPred = gridPointsForPred;

            const network = NeuralNetwork.fromConfig(this.networkConfig);
            if (this.networkConfig.optimizer) {
                network.setOptimizer(this.networkConfig.optimizer, { learningRate: this.trainingConfig.learningRate });
            }

            this.state = {
                ...this.state,
                network,
                trainData: currentTrainData,
                testData: currentTestData,
                useNormalization: this.dataConfig.useNormalization,
            };

            if (this.visualElements) {
                initializeVisualization(this.visualElements, rawTrainData, gridData, this.dataConfig.dataFunction);
            }
        } catch (error) {
            console.error('Failed to initialize NN playground:', error);
        }
    }

    /**
     * Start or resume training the neural network
     * @param onEpochEndUiCallback Callback function called at the end of each epoch
     * @param startEpochOverride Optional starting epoch
     */
    async startTraining(
        onEpochEndUiCallback?: (epoch: number, loss: number, progress: number) => void,
        startEpochOverride: number = 0
    ): Promise<void> {
        if (!this.state.network || !this.state.trainData || this.state.isTraining) {
            console.warn('Cannot start training: network not initialized, no train data, or already training.');
            return;
        }

        this.state.isTraining = true;
        let shouldStopTraining = false;
        this.trainingStopSignal = () => shouldStopTraining;

        const startEpoch = this.state.currentEpoch > 0 && this.state.currentEpoch < this.trainingConfig.numEpochs - 1 ? this.state.currentEpoch : 0;
        if (startEpoch === 0) {
            this.state.currentEpoch = 0;
            this.state.progress = 0;
        }

        const trainingConfigForRun: TrainingConfig = {
            ...this.trainingConfig,
            startEpoch: startEpoch
        };

        if (this.networkConfig.optimizer && this.state.network) {
            this.state.network.setOptimizer(this.networkConfig.optimizer, { learningRate: trainingConfigForRun.learningRate });
        }

        try {
            this.currentTrainingPromise = this.state.network.train(
                this.state.trainData.X,
                this.state.trainData.Y,
                trainingConfigForRun,
                this.state.normalizedGridPointsForPred,
                (epoch, loss, progress) => {
                    this.state.currentEpoch = epoch;
                    this.state.progress = progress;
                    if (onEpochEndUiCallback) onEpochEndUiCallback(epoch, loss, progress);

                    if (this.visualElements && this.state.network && this.state.gridData) {
                        const history = this.state.network.getHistory();
                        let vizPredictions = history.predictions;

                        if (this.state.useNormalization && this.state.scaler && history.predictions.length > 0) {
                            const lastGridPredIndex = history.predictions.length - 1;
                            const denormalizedLastGridPred = this.state.scaler.inverseTransformY(history.predictions[lastGridPredIndex]);
                            vizPredictions = [...history.predictions];
                            vizPredictions[lastGridPredIndex] = denormalizedLastGridPred;
                        }

                        updateVisualization(this.visualElements, { ...history, predictions: vizPredictions }, this.state.gridData, epoch, trainingConfigForRun.numEpochs);
                    }
                },
                this.state.testData || undefined,
                () => !shouldStopTraining
            );

            await this.currentTrainingPromise;
            console.log("Training finished or stopped.");

        } catch (error) {
            console.error('Training failed:', error);
        } finally {
            this.state.isTraining = false;
            this.trainingStopSignal = null;
            this.currentTrainingPromise = null;
            if (onEpochEndUiCallback && this.state.network) {
                const finalHistory = this.state.network.getHistory();
                const lastEpoch = finalHistory.epochs.length > 0 ? finalHistory.epochs[finalHistory.epochs.length - 1] : this.trainingConfig.numEpochs - 1;
                const lastLoss = finalHistory.loss.length > 0 ? finalHistory.loss[finalHistory.loss.length - 1] : 0;
                onEpochEndUiCallback(lastEpoch, lastLoss, 100);
            }
        }
    }

    /**
     * Stop the current training process
     */
    stopTraining(): void {
        if (this.trainingStopSignal) {
            console.log("Requesting training to stop...");
            this.trainingStopSignal = () => true;
        }
    }

    /**
     * Reset the playground to initial state
     */
    reset(): void {
        this.stopTraining();
        this.state.isTraining = false;
        this.state.currentEpoch = 0;
        this.state.progress = 0;
        this.initialize();
    }

    /**
     * Set the global weight initializer and reinitialize weights
     * @param initializer Name of the weight initializer
     */
    setWeightInitializer(initializer: string): void {
        this.networkConfig.weightInitializer = initializer;
        if (this.state.network) {
            this.state.network.reinitializeWeights(initializer);
        }
    }

    /**
     * Set the weight initializer for a specific layer
     * @param layerIndex Index of the layer
     * @param initializer Name of the weight initializer
     */
    setLayerInitializer(layerIndex: number, initializer: string): void {
        if (!this.networkConfig.layerInitializers) {
            this.networkConfig.layerInitializers = Array(this.networkConfig.hiddenDims.length + 1).fill(this.networkConfig.weightInitializer || 'he');
        }
        while (this.networkConfig.layerInitializers.length <= layerIndex) {
            this.networkConfig.layerInitializers.push(this.networkConfig.weightInitializer || 'he');
        }
        if (layerIndex >= 0 && layerIndex < this.networkConfig.layerInitializers.length) {
            this.networkConfig.layerInitializers[layerIndex] = initializer;
            if (this.state.network) {
                this.state.network.setLayerInitializer(layerIndex, initializer);
            }
        }
    }

    /**
     * Set the optimizer for the network
     * @param optimizerName Name of the optimizer
     */
    setOptimizer(optimizerName: string): void {
        this.networkConfig.optimizer = optimizerName;
        if (this.state.network) {
            this.state.network.setOptimizer(optimizerName, { learningRate: this.trainingConfig.learningRate });
        }
    }

    /**
     * Set whether to use data normalization
     * @param useNormalization Whether to normalize data
     */
    setUseNormalization(useNormalization: boolean): void {
        if (this.dataConfig.useNormalization !== useNormalization) {
            this.dataConfig.useNormalization = useNormalization;
            this.reset();
        }
    }

    /**
     * Get the current state of the playground
     * @returns Current playground state
     */
    getState(): PlaygroundState {
        return { ...this.state };
    }
}

export type { NeuralNetwork, TrainingConfig as NNTrainingConfig, NetworkConfig as NNNetworkConfig, TrainingHistory as NNTrainingHistory };

export default {
    NeuralNetwork,
    NNPlaygroundController
}; 