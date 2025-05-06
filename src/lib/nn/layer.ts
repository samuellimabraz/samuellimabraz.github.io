import { ActivationFn } from './activation';
import { WeightInitializer, getInitializer, getInitializerForActivation } from './initializers';
import { Gradients } from './optimizers';

/**
 * Represents a fully connected layer in a neural network
 * Performs the core transformation: output = activation(weights * input + bias)
 */
export class Layer {
    private inputDim: number;
    private outputDim: number;
    private activation: ActivationFn;
    private useBias: boolean;
    private initializer: WeightInitializer;

    public weights: number[][];
    public bias: number[];

    // Cache for backpropagation
    private cache: {
        input?: number[];
        z?: number[];
        output?: number[];
    };

    /**
     * Creates a fully connected neural network layer
     * @param inputDim Number of input features
     * @param outputDim Number of output features (neurons)
     * @param activation Activation function to use
     * @param useBias Whether to use bias terms (default: true)
     * @param initializer Weight initializer strategy or name
     */
    constructor(
        inputDim: number,
        outputDim: number,
        activation: ActivationFn,
        useBias: boolean = true,
        initializer?: WeightInitializer | string,
    ) {
        this.inputDim = inputDim;
        this.outputDim = outputDim;
        this.activation = activation;
        this.useBias = useBias;
        this.cache = {};

        if (initializer) {
            if (typeof initializer === 'string') {
                this.initializer = getInitializer(initializer);
            } else {
                this.initializer = initializer;
            }
        } else {
            this.initializer = getInitializerForActivation(
                activation.constructor.name.toLowerCase()
            );
        }

        this.weights = this.initializer.initialize(inputDim, outputDim);
        this.bias = Array(outputDim).fill(0);
    }

    /**
     * Forward pass through the layer
     * Computes output = activation(weights * input + bias)
     * @param input Input vector
     * @returns Output after applying weights, bias and activation
     */
    forward(input: number[]): number[] {
        // Store input for backpropagation
        this.cache.input = [...input];

        // (z = Wx + b)
        const z: number[] = Array(this.outputDim).fill(0);

        for (let i = 0; i < this.outputDim; i++) {
            for (let j = 0; j < this.inputDim; j++) {
                z[i] += this.weights[i][j] * input[j];
            }

            if (this.useBias) {
                z[i] += this.bias[i];
            }
        }

        // Store z values for backpropagation
        this.cache.z = [...z];

        const output = this.activation.activate(z);

        // Store output for backpropagation
        this.cache.output = [...output];

        return output;
    }

    /**
     * Backward pass through the layer
     * Computes gradients for backpropagation
     * @param dOutput Gradient of the loss with respect to the layer's output
     * @returns Object containing input gradients and weight/bias gradients
     */
    backward(dOutput: number[]): { dInput: number[], gradients: Gradients } {
        const input = this.cache.input!;
        const z = this.cache.z!;
        const m = 1; // Batch size

        const dZ = dOutput.map((dOut, i) => dOut * this.activation.derivative(z)[i]);

        // Calculate gradients
        const dWeights: number[][] = Array(this.outputDim).fill(0).map(() => Array(this.inputDim).fill(0));

        for (let i = 0; i < this.outputDim; i++) {
            for (let j = 0; j < this.inputDim; j++) {
                dWeights[i][j] = dZ[i] * input[j] / m;
            }
        }

        const dBias = this.useBias ? dZ.map(val => val / m) : Array(this.outputDim).fill(0);

        // Calculate dInput (for previous layer)
        const dInput: number[] = Array(this.inputDim).fill(0);

        for (let j = 0; j < this.inputDim; j++) {
            for (let i = 0; i < this.outputDim; i++) {
                dInput[j] += this.weights[i][j] * dZ[i];
            }
        }

        return {
            dInput,
            gradients: {
                dWeights,
                dBias
            }
        };
    }

    /**
     * Get a copy of the layer's parameters
     * @returns Deep copy of weights and bias
     */
    getParameters(): { weights: number[][], bias: number[] } {
        return {
            weights: this.weights.map(row => [...row]),
            bias: [...this.bias]
        };
    }

    /**
     * Set the layer's parameters
     * @param parameters Object containing weights and bias arrays
     */
    setParameters(parameters: { weights: number[][], bias: number[] }): void {
        this.weights = parameters.weights.map(row => [...row]);
        this.bias = [...parameters.bias];
    }

    /**
     * Reinitialize weights with a specified or current initializer
     * @param initializer Optional new weight initializer to use
     */
    reinitializeWeights(initializer?: WeightInitializer | string): void {
        if (initializer) {
            if (typeof initializer === 'string') {
                this.initializer = getInitializer(initializer);
            } else {
                this.initializer = initializer;
            }
        }

        this.weights = this.initializer.initialize(this.inputDim, this.outputDim);
        this.bias = Array(this.outputDim).fill(0);
    }
} 