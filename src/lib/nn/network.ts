import { ActivationFn, getActivation } from './activation';
import { Layer } from './layer';
import { WeightInitializer } from './initializers';
import { Optimizer, getOptimizer, Gradients } from './optimizers';
import { Loss, getLoss } from './loss';

/**
 * Configuration for creating a neural network
 */
export interface NetworkConfig {
    /**
     * Dimension of the input layer
     */
    inputDim: number;

    /**
     * Dimensions of hidden layers
     */
    hiddenDims: number[];

    /**
     * Dimension of the output layer
     */
    outputDim: number;

    /**
     * Activation functions for hidden layers
     */
    hiddenActivations: string[];

    /**
     * Activation function for the output layer
     */
    outputActivation: string;

    /**
     * Whether to use bias terms in layers
     */
    useBias: boolean;

    /**
     * Global weight initializer for all layers
     */
    weightInitializer?: string;

    /**
     * Specific initializers for each layer
     */
    layerInitializers?: string[];

    /**
     * Optimizer to use for training
     */
    optimizer?: string;

    /**
     * Loss function to use for training
     */
    loss?: string;
}

/**
 * Configuration for the training process
 */
export interface TrainingConfig {
    /**
     * Learning rate for optimization
     */
    learningRate: number;

    /**
     * Number of training epochs
     */
    numEpochs: number;

    /**
     * Batch size for mini-batch training
     */
    batchSize: number;

    /**
     * Noise level for training data
     */
    noise: number;

    /**
     * Starting epoch number (for continued training)
     */
    startEpoch?: number;
}

/**
 * Training history to track performance over time
 */
export interface TrainingHistory {
    /**
     * Loss values per epoch
     */
    loss: number[];

    /**
     * Gradient norm per epoch
     */
    gradientNorm: number[];

    /**
     * Tracked weights for visualization
     */
    selectedWeightsTrace: number[][];

    /**
     * Epoch numbers
     */
    epochs: number[];

    /**
     * Model predictions at specific epochs
     */
    predictions: number[][][];

    /**
     * Training accuracy per epoch
     */
    trainAccuracy: number[];

    /**
     * Testing accuracy per epoch
     */
    testAccuracy: number[];
}

/**
 * Network parameters structure
 */
export interface NetworkParameters {
    /**
     * Weights for all layers
     */
    weights: number[][][];

    /**
     * Biases for all layers
     */
    biases: number[][];
}

/**
 * Network gradients structure
 */
export interface NetworkGradients {
    /**
     * Weight gradients for all layers
     */
    dWeights: number[][][];

    /**
     * Bias gradients for all layers
     */
    dBiases: number[][];
}

/**
 * Neural Network implementation with fully connected layers
 */
export class NeuralNetwork {
    private layers: Layer[] = [];
    private useBias: boolean;
    private history: TrainingHistory;
    private weightInitializer?: string;
    private layerInitializers?: string[];
    private optimizerName?: string;
    private optimizerConfig: any = {};
    private layerOptimizers: Optimizer[] = [];
    private loss: Loss;

    /**
     * Create a new neural network
     * @param useBias Whether to use bias terms in layers
     * @param weightInitializer Global weight initializer name
     * @param optimizerName Name of the optimizer to use
     * @param layerInitializers Specific initializers for each layer
     * @param lossName Name of the loss function
     */
    constructor(
        useBias: boolean = true,
        weightInitializer?: string,
        optimizerName: string = 'sgd',
        layerInitializers?: string[],
        lossName: string = 'mse'
    ) {
        this.useBias = useBias;
        this.weightInitializer = weightInitializer;
        this.layerInitializers = layerInitializers;
        this.optimizerName = optimizerName;
        this.loss = getLoss(lossName);
        this.history = {
            loss: [],
            gradientNorm: [],
            selectedWeightsTrace: [],
            epochs: [],
            predictions: [],
            trainAccuracy: [],
            testAccuracy: []
        };
    }

    /**
     * Add a layer to the network
     * @param outputDim Number of neurons in the layer
     * @param activation Activation function for the layer
     * @param inputDim Optional input dimension (required for first layer)
     * @param layerIndex Optional index of the layer for initializer selection
     */
    addLayer(
        outputDim: number,
        activation: ActivationFn,
        inputDim?: number,
        layerIndex?: number
    ): void {
        if (!this.layers.length && inputDim === undefined) {
            throw new Error('Input dimension must be specified for the first layer');
        }
        if (inputDim === undefined) {
            const prevLayer = this.layers[this.layers.length - 1];
            inputDim = prevLayer.getParameters().weights.length; // Output dim of prev layer is rows in weight matrix
        }

        let layerInitializer = this.weightInitializer;
        if (this.layerInitializers && layerIndex !== undefined && layerIndex < this.layerInitializers.length) {
            layerInitializer = this.layerInitializers[layerIndex];
        }

        const layer = new Layer(inputDim, outputDim, activation, this.useBias, layerInitializer);
        this.layers.push(layer);

        // Create an optimizer for this new layer if an optimizer type has been set
        if (this.optimizerName) {
            this.layerOptimizers.push(getOptimizer(this.optimizerName, this.optimizerConfig));
        } else {
            // Add a default optimizer if none set yet (e.g. SGD)
            this.layerOptimizers.push(getOptimizer('sgd', { learningRate: 0.01 }));
        }
    }

    /**
     * Perform forward pass through the network
     * @param input Input sample
     * @returns Network output
     */
    forward(input: number[]): number[] {
        let A = [...input];
        for (const layer of this.layers) {
            A = layer.forward(A);
        }
        return A;
    }

    /**
     * Make predictions for multiple input samples
     * @param X Input samples
     * @returns Predictions for all samples
     */
    predict(X: number[][]): number[][] {
        return X.map(x => this.forward(x));
    }

    /**
     * Compute the cost between predictions and targets
     * @param predictions Network predictions
     * @param targets Target values
     * @returns Loss value
     */
    computeCost(predictions: number[][], targets: number[][]): number {
        return this.loss.forward(predictions, targets);
    }

    /**
     * Perform backward pass (backpropagation) through the network
     * @param X_sample Input sample
     * @param Y_sample Target sample
     * @returns Output gradient and layer gradients
     */
    backward(X_sample: number[], Y_sample: number[]): { dOutput: number[], layerGradients: Gradients[] } {
        const networkOutput = this.forward(X_sample);
        const lossGradientVsOutput = this.loss.backward([networkOutput], [Y_sample])[0];

        const allLayerGradients: Gradients[] = [];
        let dA_prev = [...lossGradientVsOutput]; // Gradient of loss wrt activation of current layer (starting from output)

        for (let i = this.layers.length - 1; i >= 0; i--) {
            const { dInput, gradients: layerGrad } = this.layers[i].backward(dA_prev);
            allLayerGradients.unshift(layerGrad);
            dA_prev = dInput; // Gradient of loss wrt activation of previous layer
        }
        return { dOutput: lossGradientVsOutput, layerGradients: allLayerGradients };
    }

    /**
     * Set the optimizer for the network
     * @param optimizerName Name of the optimizer
     * @param config Configuration for the optimizer
     */
    setOptimizer(optimizerName: string, config: any = {}): void {
        this.optimizerName = optimizerName;
        this.optimizerConfig = config; // Store config (e.g. learningRate)
        this.layerOptimizers = []; // Clear existing optimizers
        for (let i = 0; i < this.layers.length; i++) {
            this.layerOptimizers.push(getOptimizer(this.optimizerName, this.optimizerConfig));
        }
    }

    /**
     * Update network parameters based on computed gradients
     * @param allLayerGradients Gradients for all layers
     */
    updateParameters(allLayerGradients: Gradients[]): void {
        if (allLayerGradients.length !== this.layers.length || allLayerGradients.length !== this.layerOptimizers.length) {
            console.error("Mismatch between gradients, layers, or optimizers count.");
            return;
        }

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const optimizer = this.layerOptimizers[i];
            const gradients = allLayerGradients[i];
            const currentParams = layer.getParameters();

            const { newWeights, newBias } = optimizer.update(
                currentParams.weights,
                currentParams.bias,
                gradients
            );
            layer.setParameters({ weights: newWeights, bias: newBias });
        }
    }

    /**
     * Reinitialize weights of specific or all layers
     * @param initializer Weight initializer to use
     * @param layerIndex Optional index of layer to reinitialize
     */
    reinitializeWeights(initializer?: string | WeightInitializer, layerIndex?: number): void {
        if (layerIndex !== undefined && layerIndex >= 0 && layerIndex < this.layers.length) {
            this.layers[layerIndex].reinitializeWeights(initializer);
            if (typeof initializer === 'string' && this.layerInitializers) {
                while (this.layerInitializers.length <= layerIndex) {
                    this.layerInitializers.push(this.weightInitializer || 'he');
                }
                this.layerInitializers[layerIndex] = initializer;
            }
        } else {
            for (const layer of this.layers) {
                layer.reinitializeWeights(initializer);
            }
            if (typeof initializer === 'string') {
                this.weightInitializer = initializer;
                if (!this.layerInitializers || this.layerInitializers.length !== this.layers.length) {
                    this.layerInitializers = Array(this.layers.length).fill(initializer);
                }
            }
        }
    }

    /**
     * Set initializer for a specific layer
     * @param layerIndex Index of the layer
     * @param initializerName Name of the initializer
     */
    setLayerInitializer(layerIndex: number, initializerName: string): void {
        if (layerIndex >= 0 && layerIndex < this.layers.length) {
            if (!this.layerInitializers || this.layerInitializers.length !== this.layers.length) {
                this.layerInitializers = this.layers.map((_, idx) =>
                    this.layerInitializers?.[idx] || this.weightInitializer || 'he'
                );
            }
            while (this.layerInitializers.length <= layerIndex) { // Should not happen if sized above
                this.layerInitializers.push(this.weightInitializer || 'he');
            }
            this.layerInitializers[layerIndex] = initializerName;
            this.layers[layerIndex].reinitializeWeights(initializerName);
        }
    }

    /**
     * Compute the norm of the gradients
     * @param gradients Gradients for all layers
     * @returns Gradient norm
     */
    computeGradientNorm(gradients: Gradients[]): number {
        let totalSum = 0;
        for (const gradientObj of gradients) {
            for (const row of gradientObj.dWeights) {
                for (const val of row) {
                    totalSum += val * val;
                }
            }
            if (this.useBias && gradientObj.dBias) {
                for (const val of gradientObj.dBias) {
                    totalSum += val * val;
                }
            }
        }
        return Math.sqrt(totalSum);
    }

    /**
     * Get the network parameters
     * @returns Network parameters object
     */
    getParameters(): any {
        const parameters: any = {};
        for (let i = 0; i < this.layers.length; i++) {
            const layerParams = this.layers[i].getParameters();
            parameters[`W${i + 1}`] = layerParams.weights;
            parameters[`b${i + 1}`] = layerParams.bias;
        }
        return parameters;
    }

    /**
     * Set the network parameters
     * @param parameters Network parameters to set
     */
    setParameters(parameters: any): void {
        for (let i = 0; i < this.layers.length; i++) {
            if (parameters[`W${i + 1}`] && parameters[`b${i + 1}`]) {
                this.layers[i].setParameters({
                    weights: parameters[`W${i + 1}`],
                    bias: parameters[`b${i + 1}`]
                });
            }
        }
    }

    /**
     * Get the input dimension of the network
     * @returns Input dimension
     */
    getInputDim(): number {
        if (this.layers.length === 0) return 0;
        return this.layers[0].getParameters().weights[0].length;
    }

    /**
     * Get the training history
     * @returns Training history object
     */
    getHistory(): TrainingHistory {
        // Ensure all arrays in history have consistent lengths for plotting
        const maxLength = this.history.epochs.length;
        return {
            ...this.history,
            loss: this.history.loss.slice(0, maxLength),
            gradientNorm: this.history.gradientNorm.slice(0, maxLength),
            predictions: this.history.predictions.filter((p, i) => {
                // Align predictions with epochs where they were recorded
                // This assumes predictions are pushed when epochs are pushed if applicable
                return this.history.epochs.includes(this.history.epochs[i]); // Simplified: ensure it's not out of bound
            }).slice(0, maxLength),
            trainAccuracy: this.history.trainAccuracy.slice(0, maxLength),
            testAccuracy: this.history.testAccuracy.slice(0, maxLength),
        };
    }

    /**
     * Create a network from configuration
     * @param config Network configuration
     * @returns Configured neural network
     */
    static fromConfig(config: NetworkConfig): NeuralNetwork {
        const model = new NeuralNetwork(
            config.useBias,
            config.weightInitializer,
            config.optimizer || 'sgd',
            config.layerInitializers,
            config.loss || 'mse'
        );
        // Set optimizer config if learningRate is available (from TrainingConfig, not NetworkConfig)
        // This implies that fromConfig might need TrainingConfig or learningRate separately
        // For now, default LR used by getOptimizer if not in config.
        if (config.optimizer) { // This ensures optimizerConfig is set for addLayer
            model.optimizerName = config.optimizer;
            // model.optimizerConfig will be {} initially, getOptimizer uses defaults.
        }


        let currentInputDim = config.inputDim;
        for (let i = 0; i < config.hiddenDims.length; i++) {
            const activation = getActivation(config.hiddenActivations[i] || 'tanh');
            model.addLayer(config.hiddenDims[i], activation, currentInputDim, i);
            currentInputDim = config.hiddenDims[i];
        }
        const outputActivation = getActivation(config.outputActivation);
        model.addLayer(config.outputDim, outputActivation, currentInputDim, config.hiddenDims.length);

        // If a global optimizer was specified with specific config (e.g. LR), apply it
        // This is slightly redundant if addLayer already created optimizers, but setOptimizer will replace them
        // with potentially different config.
        if (config.optimizer) { // Re-call setOptimizer to ensure config is applied if it includes LR
            model.setOptimizer(config.optimizer, model.optimizerConfig); // Pass existing config which might be just {}
        }
        return model;
    }

    /**
     * Compute accuracy of predictions against targets
     * @param predictions Network predictions
     * @param targets Target values
     * @param threshold Classification threshold (for binary classification)
     * @returns Accuracy as a decimal
     */
    computeAccuracy(predictions: number[][], targets: number[][], threshold: number = 0.5): number {
        let correctCount = 0;
        const totalCount = predictions.length;
        if (totalCount === 0) return 0;

        for (let i = 0; i < totalCount; i++) {
            let correct = true;
            if (predictions[i].length !== targets[i].length) {
                // console.warn("Dimension mismatch in accuracy computation");
                correct = false; // Or handle error
            } else {
                for (let j = 0; j < predictions[i].length; j++) {
                    if (Math.abs(predictions[i][j] - targets[i][j]) > threshold) {
                        correct = false;
                        break;
                    }
                }
            }
            if (correct) correctCount++;
        }
        return correctCount / totalCount;
    }

    /**
     * Train the network on a dataset
     * @param X Input features
     * @param Y Target values
     * @param config Training configuration
     * @param gridPointsForViz Optional grid points for visualization
     * @param onEpochEnd Optional callback for epoch end
     * @param testData Optional test data for evaluation
     * @param shouldContinue Optional function to check if training should continue
     * @returns Promise resolving to training history
     */
    train(
        X: number[][],
        Y: number[][],
        config: TrainingConfig,
        gridPointsForViz: number[][] | null,
        onEpochEnd?: (epoch: number, loss: number, progress: number) => void,
        testData?: { X: number[][], Y: number[][] },
        shouldContinue?: () => boolean
    ): Promise<TrainingHistory> {
        if (!this.layers.length) {
            return Promise.reject(new Error("Network has no layers. Add layers before training."));
        }
        // Ensure optimizers have the latest learning rate from config
        this.optimizerConfig.learningRate = config.learningRate;
        if (this.optimizerName) { // Re-initialize optimizers with new LR
            this.setOptimizer(this.optimizerName, this.optimizerConfig);
        }


        if (!config.startEpoch || config.startEpoch === 0) {
            this.history = {
                loss: [], gradientNorm: [], selectedWeightsTrace: [], epochs: [],
                predictions: [], trainAccuracy: [], testAccuracy: []
            };
        }

        return new Promise((resolve, reject) => {
            const startEpoch = config.startEpoch || 0;
            let currentEpoch = startEpoch;

            const trainEpoch = () => {
                if (shouldContinue && !shouldContinue()) {
                    console.log('Training interrupted.');
                    resolve(this.getHistory());
                    return;
                }
                try {
                    const { epochLoss, epochGradientNorm } = this.trainOneEpoch(X, Y, config);
                    this.history.loss.push(epochLoss);
                    this.history.gradientNorm.push(epochGradientNorm);
                    this.history.epochs.push(currentEpoch);

                    if (currentEpoch % 5 === 0 || currentEpoch === config.numEpochs - 1) {
                        this.history.selectedWeightsTrace.push(this.getSelectedWeights());
                        if (gridPointsForViz && gridPointsForViz.length > 0) {
                            const gridPredictions = this.predict(gridPointsForViz);
                            this.history.predictions.push(gridPredictions);
                        } else {
                            this.history.predictions.push([]); // Keep length consistent
                        }
                    }

                    if (testData) {
                        const trainPredictions = this.predict(X);
                        const testPredictions = this.predict(testData.X);
                        this.history.trainAccuracy.push(this.computeAccuracy(trainPredictions, Y));
                        this.history.testAccuracy.push(this.computeAccuracy(testPredictions, testData.Y));
                    }

                    const progress = ((currentEpoch - startEpoch + 1) / (config.numEpochs - startEpoch)) * 100;
                    if (onEpochEnd) onEpochEnd(currentEpoch, epochLoss, progress);

                    if (currentEpoch >= config.numEpochs - 1) {
                        resolve(this.getHistory());
                    } else {
                        currentEpoch++;
                        setTimeout(trainEpoch, 0);
                    }
                } catch (error) {
                    console.error('Error during training epoch:', error);
                    reject(error);
                }
            };
            trainEpoch();
        });
    }

    /**
     * Train the network for one epoch
     * @param X Input features
     * @param Y Target values
     * @param config Training configuration
     * @returns Object with epoch loss and gradient norm
     */
    private trainOneEpoch(
        X: number[][], Y: number[][], config: TrainingConfig
    ): { epochLoss: number, epochGradientNorm: number } {
        const m = X.length;
        const batchSize = Math.min(config.batchSize, m);
        const numBatches = Math.ceil(m / batchSize);
        let totalLoss = 0;
        let totalGradientNorm = 0;

        for (let b = 0; b < numBatches; b++) {
            const startIdx = b * batchSize;
            const endIdx = Math.min(startIdx + batchSize, m);
            const currentBatchSize = endIdx - startIdx;
            if (currentBatchSize === 0) continue;

            const batchX = X.slice(startIdx, endIdx);
            const batchY = Y.slice(startIdx, endIdx);

            const accumulatedGradientsPerLayer: Gradients[] = [];
            for (let i = 0; i < this.layers.length; i++) {
                const W = this.layers[i].getParameters().weights;
                const Bias = this.layers[i].getParameters().bias;
                accumulatedGradientsPerLayer.push({
                    dWeights: W.map(row => Array(row.length).fill(0)),
                    dBias: Array(Bias.length).fill(0)
                });
            }

            const batchPredictionsForLoss: number[][] = [];
            const batchTargetsForLoss: number[][] = [];

            for (let i = 0; i < currentBatchSize; i++) {
                const x_sample = batchX[i];
                const y_sample = batchY[i];

                // Forward pass for loss calculation (done per sample then averaged or by loss fn)
                batchPredictionsForLoss.push(this.forward(x_sample));
                batchTargetsForLoss.push(y_sample);

                // Backward pass to get gradients for this sample
                const { layerGradients } = this.backward(x_sample, y_sample);

                // Accumulate gradients
                for (let layerIdx = 0; layerIdx < layerGradients.length; layerIdx++) {
                    const grad = layerGradients[layerIdx];
                    const accGrad = accumulatedGradientsPerLayer[layerIdx];
                    for (let r = 0; r < grad.dWeights.length; r++) {
                        for (let c = 0; c < grad.dWeights[r].length; c++) {
                            accGrad.dWeights[r][c] += grad.dWeights[r][c];
                        }
                    }
                    for (let k = 0; k < grad.dBias.length; k++) {
                        accGrad.dBias[k] += grad.dBias[k];
                    }
                }
            }

            // Average loss over batch
            totalLoss += this.loss.forward(batchPredictionsForLoss, batchTargetsForLoss);

            // Average gradients over batch
            for (const accGrad of accumulatedGradientsPerLayer) {
                for (let r = 0; r < accGrad.dWeights.length; r++) {
                    for (let c = 0; c < accGrad.dWeights[r].length; c++) {
                        accGrad.dWeights[r][c] /= currentBatchSize;
                    }
                }
                for (let k = 0; k < accGrad.dBias.length; k++) {
                    accGrad.dBias[k] /= currentBatchSize;
                }
            }

            this.updateParameters(accumulatedGradientsPerLayer);
            totalGradientNorm += this.computeGradientNorm(accumulatedGradientsPerLayer);
        }
        return { epochLoss: totalLoss / numBatches, epochGradientNorm: totalGradientNorm / numBatches };
    }

    /**
     * Get selected weights for visualization
     * @returns Array of selected weights
     */
    private getSelectedWeights(): number[] {
        const params = this.getParameters();
        const selectedWeights: number[] = [];
        for (let layer = 1; layer <= this.layers.length; layer++) {
            const weights = params[`W${layer}`];
            if (weights && weights.length > 0 && weights[0].length > 0) {
                const numToTake = Math.min(5, weights[0].length);
                for (let i = 0; i < numToTake; i++) {
                    selectedWeights.push(weights[0][i]);
                }
            }
        }
        return selectedWeights;
    }

    /**
     * Set the loss function
     * @param lossName Name or instance of loss function
     */
    setLoss(lossName: string | Loss): void {
        if (typeof lossName === 'string') {
            this.loss = getLoss(lossName);
        } else {
            this.loss = lossName;
        }
    }

    /**
     * Get the loss function
     * @returns Current loss function
     */
    getLoss(): Loss {
        return this.loss;
    }
} 