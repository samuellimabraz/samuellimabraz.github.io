import { ActivationFn, getActivation } from './activation';
import { Layer } from './layer';

export interface NetworkConfig {
    inputDim: number;
    hiddenDims: number[];
    outputDim: number;
    hiddenActivations: string[];
    outputActivation: string;
    useBias: boolean;
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

    constructor(useBias: boolean = true, seed?: number) {
        this.useBias = useBias;
        this.seed = seed;
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
        inputDim?: number
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

        // Create and add the new layer
        const layer = new Layer(inputDim, outputDim, activation, this.useBias, this.seed);
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
        const model = new NeuralNetwork(config.useBias);

        // Add hidden layers
        for (let i = 0; i < config.hiddenDims.length; i++) {
            const activation = getActivation(config.hiddenActivations[i] || 'tanh');
            const inputDim = i === 0 ? config.inputDim : config.hiddenDims[i - 1];
            model.addLayer(config.hiddenDims[i], activation, inputDim);
        }

        // Add output layer
        const outputActivation = getActivation(config.outputActivation);
        model.addLayer(config.outputDim, outputActivation);

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

            // Store initial selected weights
            const initialWeights = this.getSelectedWeights();
            this.history.selectedWeightsTrace.push([...initialWeights, 0]);
        }

        return new Promise((resolve, reject) => {
            // Start from the specified epoch or from 0
            let epoch = config.startEpoch || 0;
            console.log(`Starting training from epoch ${epoch} to ${config.numEpochs}`);

            // Use a named function so we can reference it for cleanup
            const trainEpoch = () => {
                // Check if we should continue training
                if (shouldContinue && !shouldContinue()) {
                    console.log(`Training stopped at epoch ${epoch} due to external signal`);
                    resolve(this.history);
                    return;
                }

                if (epoch >= config.numEpochs) {
                    console.log(`Training complete at epoch ${epoch}`);
                    resolve(this.history);
                    return;
                }

                try {
                    // Run one epoch of training
                    const { loss, gradientNorm } = this.trainOneEpoch(X, Y, config);

                    // Update history
                    this.history.loss.push(loss);
                    this.history.gradientNorm.push(gradientNorm);

                    // Calculate and record accuracy
                    const trainPredictions = this.predict(X);
                    const trainAccuracy = this.computeAccuracy(trainPredictions, Y, 0.5);
                    this.history.trainAccuracy.push(trainAccuracy);

                    // If test data is provided, calculate test accuracy
                    if (testData && testData.X.length > 0) {
                        const testPredictions = this.predict(testData.X);
                        const testAccuracy = this.computeAccuracy(testPredictions, testData.Y, 0.5);
                        this.history.testAccuracy.push(testAccuracy);
                    }

                    // Track selected weights
                    const selectedWeights = this.getSelectedWeights();
                    this.history.selectedWeightsTrace.push([...selectedWeights, loss]);

                    // Record predictions for every epoch (or at a reasonable frequency for performance)
                    // For very large epoch counts, we may want to throttle this
                    const updateFrequency = Math.max(1, Math.floor(config.numEpochs / 100));

                    if (epoch % updateFrequency === 0 || epoch === config.numEpochs - 1) {
                        // We're no longer storing predictions here
                        // The controller will generate predictions for visualization using the grid data
                        // and add them to the history at the appropriate times
                        this.history.epochs.push(epoch);
                    }

                    // Report progress
                    const progress = (epoch + 1) / config.numEpochs * 100;
                    if (onEpochEnd) {
                        onEpochEnd(epoch, loss, progress);
                    }

                    // Schedule next epoch
                    epoch++;

                    // Use requestAnimationFrame if available, otherwise setTimeout
                    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                        window.requestAnimationFrame(trainEpoch);
                    } else {
                        setTimeout(trainEpoch, 0);
                    }
                } catch (error) {
                    console.log(`Training interrupted at epoch ${epoch}`);
                    reject(error);
                }
            };

            // Start training - use requestAnimationFrame for better browser performance if available
            if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                window.requestAnimationFrame(trainEpoch);
            } else {
                setTimeout(trainEpoch, 0);
            }
        });
    }

    // Train one epoch
    private trainOneEpoch(
        X: number[][],
        Y: number[][],
        config: TrainingConfig
    ): { loss: number, gradientNorm: number } {
        // Shuffle data
        const indices = Array.from({ length: X.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        const X_shuffled = indices.map(i => X[i]);
        const Y_shuffled = indices.map(i => Y[i]);

        // Process in mini-batches
        const numBatches = Math.ceil(X.length / config.batchSize);
        let epochLoss = 0;

        for (let batch = 0; batch < numBatches; batch++) {
            const startIdx = batch * config.batchSize;
            const endIdx = Math.min((batch + 1) * config.batchSize, X.length);

            const X_batch = X_shuffled.slice(startIdx, endIdx);
            const Y_batch = Y_shuffled.slice(startIdx, endIdx);

            // Forward pass to compute loss
            const predictions = this.predict(X_batch);
            const batchLoss = this.computeCost(predictions, Y_batch);
            epochLoss += batchLoss;

            // Backward pass to compute gradients
            const { gradients } = this.backward(X_batch, Y_batch);

            // Update parameters
            this.updateParameters(gradients, config.learningRate);
        }

        // Compute full gradients for gradient norm
        const { gradients } = this.backward(X, Y);
        const gradientNorm = this.computeGradientNorm(gradients);

        return {
            loss: epochLoss / numBatches,
            gradientNorm
        };
    }

    // Get selected weights for visualization (first two weights of first layer)
    private getSelectedWeights(): number[] {
        if (this.layers.length > 0) {
            const firstLayerWeights = this.layers[0].getParameters().weights;
            if (firstLayerWeights.length > 0 && firstLayerWeights[0].length > 1) {
                return [firstLayerWeights[0][0], firstLayerWeights[0][1]];
            }
        }
        return [0, 0];
    }
} 