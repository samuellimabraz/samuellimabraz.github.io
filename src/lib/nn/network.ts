import { ActivationFn, getActivation } from './activation';
import { Layer } from './layer';
import { WeightInitializer, getInitializer } from './initializers';
import { Optimizer, getOptimizer } from './optimizers';

export interface NetworkConfig {
    inputDim: number;
    hiddenDims: number[];
    outputDim: number;
    hiddenActivations: string[];
    outputActivation: string;
    useBias: boolean;
    weightInitializer?: string; // Global weight initialization method (fallback)
    layerInitializers?: string[]; // Per-layer weight initialization methods
    optimizer?: string; // Name of optimizer to use
}

export interface TrainingConfig {
    learningRate: number;
    numEpochs: number;
    batchSize: number;
    noise: number;
    startEpoch?: number; // Optional starting epoch for resuming training
}

export interface TrainingHistory {
    loss: number[];
    gradientNorm: number[];
    selectedWeightsTrace: number[][];
    epochs: number[];
    predictions: number[][][];
    trainAccuracy: number[];
    testAccuracy: number[];
}

export class NeuralNetwork {
    private layers: Layer[] = [];
    private useBias: boolean;
    private seed?: number;
    private history: TrainingHistory;
    private weightInitializer?: string;
    private layerInitializers?: string[];
    private optimizer?: string;

    constructor(
        useBias: boolean = true,
        seed?: number,
        weightInitializer?: string,
        optimizer?: string,
        layerInitializers?: string[]
    ) {
        this.useBias = useBias;
        this.seed = seed;
        this.weightInitializer = weightInitializer;
        this.layerInitializers = layerInitializers;
        this.optimizer = optimizer;
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

    // Add a new layer to the network
    addLayer(
        outputDim: number,
        activation: ActivationFn,
        inputDim?: number,
        layerIndex?: number
    ): void {
        // For the first layer, input dimension must be specified
        if (!this.layers.length && inputDim === undefined) {
            throw new Error('Input dimension must be specified for the first layer');
        }

        // For subsequent layers, input dimension is the output dimension of the previous layer
        if (inputDim === undefined) {
            const prevLayer = this.layers[this.layers.length - 1];
            const dummyOutput = prevLayer.forward(Array(this.getInputDim()).fill(0));
            inputDim = dummyOutput.length;
        }

        // Determine which initializer to use for this layer
        let layerInitializer = this.weightInitializer;
        if (this.layerInitializers && layerIndex !== undefined && layerIndex < this.layerInitializers.length) {
            // Use layer-specific initializer if available
            layerInitializer = this.layerInitializers[layerIndex];
        }

        // Create and add the new layer with the specified initializer
        const layer = new Layer(inputDim, outputDim, activation, this.useBias, layerInitializer, this.seed);

        // Set optimizer if specified
        if (this.optimizer) {
            layer.setOptimizer(this.optimizer, { learningRate: 0.01 }); // Default learning rate will be overridden during training
        }

        this.layers.push(layer);
    }

    // Forward propagation through all layers
    forward(input: number[]): number[] {
        let A = [...input];

        // Propagate through each layer
        for (const layer of this.layers) {
            A = layer.forward(A);
        }

        return A;
    }

    // Make predictions for multiple inputs
    predict(X: number[][]): number[][] {
        return X.map(x => this.forward(x));
    }

    // Compute mean squared error
    computeCost(predictions: number[][], targets: number[][]): number {
        let sum = 0;
        const n = predictions.length;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < predictions[i].length; j++) {
                sum += Math.pow(predictions[i][j] - targets[i][j], 2);
            }
        }

        return sum / n;
    }

    // Backward propagation to calculate gradients
    backward(X: number[][], Y: number[][]): { dOutput: number[], gradients: any[] } {
        const m = X.length;
        const output = this.forward(X[0]);
        const dOutput = output.map((out, i) => 2 * (out - Y[0][i]) / m);

        const allGradients = [];
        let dA = [...dOutput];

        // Propagate backward through each layer
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const { dInput, gradients } = this.layers[i].backward(dA);
            allGradients.unshift(gradients);
            dA = dInput;
        }

        return { dOutput, gradients: allGradients };
    }

    // Update parameters for all layers
    updateParameters(gradients: any[], learningRate: number): void {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].updateParameters(gradients[i], learningRate);
        }
    }

    // Set optimizer for all layers
    setOptimizer(optimizer: string | Optimizer, config: any = {}): void {
        // If learning rate is not specified, use default
        if (!config.learningRate) {
            config.learningRate = 0.01;
        }

        for (const layer of this.layers) {
            layer.setOptimizer(optimizer, config);
        }

        // Store optimizer name if it's a string
        if (typeof optimizer === 'string') {
            this.optimizer = optimizer;
        }
    }

    // Reinitialize all weights in the network
    reinitializeWeights(initializer?: string | WeightInitializer, layerIndex?: number): void {
        if (layerIndex !== undefined && layerIndex >= 0 && layerIndex < this.layers.length) {
            // Reinitialize a specific layer
            this.layers[layerIndex].reinitializeWeights(initializer);

            // Update the layer initializer if it's a string
            if (typeof initializer === 'string' && this.layerInitializers) {
                // Make sure layerInitializers array is properly sized
                while (this.layerInitializers.length <= layerIndex) {
                    this.layerInitializers.push(this.weightInitializer || 'he');
                }
                this.layerInitializers[layerIndex] = initializer;
            }
        } else {
            // Reinitialize all layers
            for (const layer of this.layers) {
                layer.reinitializeWeights(initializer);
            }

            // Store initializer name if it's a string
            if (typeof initializer === 'string') {
                this.weightInitializer = initializer;

                // Reset all layer initializers to this one if requested
                if (!this.layerInitializers) {
                    this.layerInitializers = Array(this.layers.length).fill(initializer);
                }
            }
        }
    }

    // Set initializer for a specific layer
    setLayerInitializer(layerIndex: number, initializer: string): void {
        if (layerIndex >= 0 && layerIndex < this.layers.length) {
            // Initialize layerInitializers array if it doesn't exist
            if (!this.layerInitializers) {
                this.layerInitializers = Array(this.layers.length).fill(this.weightInitializer || 'he');
            }

            // Make sure layerInitializers array is properly sized
            while (this.layerInitializers.length <= layerIndex) {
                this.layerInitializers.push(this.weightInitializer || 'he');
            }

            // Update the layer initializer
            this.layerInitializers[layerIndex] = initializer;

            // Reinitialize the layer with the new initializer
            this.layers[layerIndex].reinitializeWeights(initializer);
        }
    }

    // Compute the Frobenius norm of all gradients
    computeGradientNorm(gradients: any[]): number {
        let totalSum = 0;

        for (const gradientObj of gradients) {
            // Sum squares of weight gradients
            for (const row of gradientObj.dWeights) {
                for (const val of row) {
                    totalSum += val * val;
                }
            }

            // Sum squares of bias gradients
            if (this.useBias) {
                for (const val of gradientObj.dBias) {
                    totalSum += val * val;
                }
            }
        }

        return Math.sqrt(totalSum);
    }

    // Get all network parameters
    getParameters(): any {
        const parameters: any = {};

        for (let i = 0; i < this.layers.length; i++) {
            const layerParams = this.layers[i].getParameters();
            parameters[`W${i + 1}`] = layerParams.weights;
            parameters[`b${i + 1}`] = layerParams.bias;
        }

        return parameters;
    }

    // Set all network parameters
    setParameters(parameters: any): void {
        for (let i = 0; i < this.layers.length; i++) {
            const layerParams = {
                weights: parameters[`W${i + 1}`],
                bias: parameters[`b${i + 1}`]
            };
            this.layers[i].setParameters(layerParams);
        }
    }

    // Get input dimension
    getInputDim(): number {
        if (this.layers.length === 0) {
            return 0;
        }

        // For the first layer, calculate input dimension based on weight matrix
        return this.layers[0].getParameters().weights[0].length;
    }

    // Get training history
    getHistory(): TrainingHistory {
        return this.history;
    }

    // Create neural network from configuration
    static fromConfig(config: NetworkConfig): NeuralNetwork {
        const model = new NeuralNetwork(
            config.useBias,
            undefined, // seed
            config.weightInitializer,
            config.optimizer,
            config.layerInitializers
        );

        // Add hidden layers
        for (let i = 0; i < config.hiddenDims.length; i++) {
            const activation = getActivation(config.hiddenActivations[i] || 'tanh');
            const inputDim = i === 0 ? config.inputDim : config.hiddenDims[i - 1];
            model.addLayer(config.hiddenDims[i], activation, inputDim, i);
        }

        // Add output layer
        const outputActivation = getActivation(config.outputActivation);
        model.addLayer(config.outputDim, outputActivation, undefined, config.hiddenDims.length);

        return model;
    }

    // Calculate accuracy for regression (using a threshold for "correct" predictions)
    computeAccuracy(predictions: number[][], targets: number[][], threshold: number = 0.5): number {
        let correctCount = 0;
        const totalCount = predictions.length;

        for (let i = 0; i < totalCount; i++) {
            let correct = true;
            for (let j = 0; j < predictions[i].length; j++) {
                // For regression tasks, we consider a prediction "correct" if it's within threshold of the target
                if (Math.abs(predictions[i][j] - targets[i][j]) > threshold) {
                    correct = false;
                    break;
                }
            }
            if (correct) correctCount++;
        }

        return totalCount > 0 ? correctCount / totalCount : 0;
    }

    // Train the neural network
    train(
        X: number[][],
        Y: number[][],
        config: TrainingConfig,
        onEpochEnd?: (epoch: number, loss: number, progress: number) => void,
        testData?: { X: number[][], Y: number[][] },
        shouldContinue?: () => boolean
    ): Promise<TrainingHistory> {
        // Initialize history if we're starting from the beginning
        if (!config.startEpoch || config.startEpoch === 0) {
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

        // Set learning rate in all layers' optimizers
        if (this.optimizer) {
            this.setOptimizer(this.optimizer, { learningRate: config.learningRate });
        }

        return new Promise((resolve, reject) => {
            // Use the current epoch or start from 0
            const startEpoch = config.startEpoch || 0;
            let currentEpoch = startEpoch;

            // Recursive function to train one epoch at a time, allowing for UI updates
            const trainEpoch = () => {
                // Check if we should continue (if shouldContinue is provided)
                if (shouldContinue && !shouldContinue()) {
                    console.log('Training interrupted by shouldContinue returning false');
                    resolve(this.history);
                    return;
                }

                try {
                    // Train one epoch
                    const { loss, gradientNorm } = this.trainOneEpoch(X, Y, config);

                    // Update history
                    this.history.loss.push(loss);
                    this.history.gradientNorm.push(gradientNorm);
                    this.history.epochs.push(currentEpoch);

                    // Track a subset of weights for visualization
                    if (currentEpoch % 5 === 0 || currentEpoch === config.numEpochs - 1) {
                        this.history.selectedWeightsTrace.push(this.getSelectedWeights());
                    }

                    // Compute accuracy if test data is provided
                    if (testData) {
                        const trainPredictions = this.predict(X);
                        const testPredictions = this.predict(testData.X);

                        const trainAccuracy = this.computeAccuracy(trainPredictions, Y);
                        const testAccuracy = this.computeAccuracy(testPredictions, testData.Y);

                        this.history.trainAccuracy.push(trainAccuracy);
                        this.history.testAccuracy.push(testAccuracy);
                    }

                    // Calculate progress
                    const progress = ((currentEpoch - startEpoch + 1) / (config.numEpochs - startEpoch)) * 100;

                    // Call the callback if provided
                    if (onEpochEnd) {
                        onEpochEnd(currentEpoch, loss, progress);
                    }

                    // Check if training is complete
                    if (currentEpoch >= config.numEpochs - 1) {
                        resolve(this.history);
                    } else {
                        // Continue training
                        currentEpoch++;
                        setTimeout(trainEpoch, 0); // Use setTimeout to avoid blocking UI
                    }
                } catch (error) {
                    console.error('Error during training:', error);
                    reject(error);
                }
            };

            // Start training
            trainEpoch();
        });
    }

    // Train one epoch
    private trainOneEpoch(
        X: number[][],
        Y: number[][],
        config: TrainingConfig
    ): { loss: number, gradientNorm: number } {
        const m = X.length;
        const batchSize = Math.min(config.batchSize, m);
        const numBatches = Math.ceil(m / batchSize);

        let totalLoss = 0;
        let totalGradientNorm = 0;

        // Process each batch
        for (let batch = 0; batch < numBatches; batch++) {
            const startIdx = batch * batchSize;
            const endIdx = Math.min(startIdx + batchSize, m);

            const batchX = X.slice(startIdx, endIdx);
            const batchY = Y.slice(startIdx, endIdx);

            // Compute forward pass and loss for the first example in batch (simplified)
            const predictions = this.forward(batchX[0]);
            const loss = batchY[0].reduce((acc, y, i) => acc + Math.pow(predictions[i] - y, 2), 0) / batchY[0].length;

            // Compute gradients
            const { gradients } = this.backward(batchX, batchY);

            // Calculate gradient norm for monitoring
            const gradientNorm = this.computeGradientNorm(gradients);

            // Update parameters
            this.updateParameters(gradients, config.learningRate);

            // Accumulate metrics
            totalLoss += loss;
            totalGradientNorm += gradientNorm;
        }

        return {
            loss: totalLoss / numBatches,
            gradientNorm: totalGradientNorm / numBatches
        };
    }

    // Get a subset of weights for visualization
    private getSelectedWeights(): number[] {
        const params = this.getParameters();
        const selectedWeights = [];

        // Just take a few weights from each layer
        for (let layer = 1; layer <= this.layers.length; layer++) {
            const weights = params[`W${layer}`];
            if (weights && weights.length > 0) {
                // Take first row, first few elements
                const numToTake = Math.min(5, weights[0].length);
                for (let i = 0; i < numToTake; i++) {
                    selectedWeights.push(weights[0][i]);
                }
            }
        }

        return selectedWeights;
    }
} 