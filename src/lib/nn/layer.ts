import { ActivationFn } from './activation';
import { WeightInitializer, getInitializer, getInitializerForActivation } from './initializers';
import { Optimizer, Gradients, getOptimizer } from './optimizers';

export class Layer {
    private inputDim: number;
    private outputDim: number;
    private activation: ActivationFn;
    private useBias: boolean;
    private initializer: WeightInitializer;
    private optimizer: Optimizer | null = null;

    // Layer parameters
    public weights: number[][];
    public bias: number[];

    // Cache for backpropagation
    private cache: {
        input?: number[];
        z?: number[];
        output?: number[];
    };

    constructor(
        inputDim: number,
        outputDim: number,
        activation: ActivationFn,
        useBias: boolean = true,
        initializer?: WeightInitializer | string,
        seed?: number
    ) {
        this.inputDim = inputDim;
        this.outputDim = outputDim;
        this.activation = activation;
        this.useBias = useBias;
        this.cache = {};

        // Set initializer
        if (initializer) {
            if (typeof initializer === 'string') {
                this.initializer = getInitializer(initializer);
            } else {
                this.initializer = initializer;
            }
        } else {
            // Auto-select initializer based on activation function
            this.initializer = getInitializerForActivation(
                activation.constructor.name.toLowerCase()
            );
        }

        // Initialize weights using the initializer
        this.weights = this.initializer.initialize(inputDim, outputDim);

        // Initialize biases with zeros
        this.bias = Array(outputDim).fill(0);
    }

    // Set optimizer for this layer
    setOptimizer(optimizer: Optimizer | string, config: any = {}): void {
        if (typeof optimizer === 'string') {
            this.optimizer = getOptimizer(optimizer, config);
        } else {
            this.optimizer = optimizer;
        }
    }

    // Forward pass
    forward(input: number[]): number[] {
        // Store input for backpropagation
        this.cache.input = [...input];

        // Calculate linear combinations (z = Wx + b)
        const z: number[] = Array(this.outputDim).fill(0);

        for (let i = 0; i < this.outputDim; i++) {
            // Calculate dot product of weights and input
            for (let j = 0; j < this.inputDim; j++) {
                z[i] += this.weights[i][j] * input[j];
            }

            // Add bias if required
            if (this.useBias) {
                z[i] += this.bias[i];
            }
        }

        // Store z values for backpropagation
        this.cache.z = [...z];

        // Apply activation function
        const output = this.activation.activate(z);

        // Store output for backpropagation
        this.cache.output = [...output];

        return output;
    }

    // Backward pass
    backward(dOutput: number[]): { dInput: number[], gradients: Gradients } {
        const input = this.cache.input!;
        const z = this.cache.z!;
        const m = 1; // Batch size

        // Calculate dZ
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

    // Update parameters
    updateParameters(gradients: Gradients, learningRate: number): void {
        if (this.optimizer) {
            // Use optimizer if available
            const { newWeights, newBias } = this.optimizer.update(
                this.weights,
                this.bias,
                gradients
            );

            this.weights = newWeights;
            this.bias = newBias;
        } else {
            // Fallback to standard SGD
            // Update weights
            for (let i = 0; i < this.outputDim; i++) {
                for (let j = 0; j < this.inputDim; j++) {
                    this.weights[i][j] -= learningRate * gradients.dWeights[i][j];
                }
            }

            // Update biases
            if (this.useBias) {
                for (let i = 0; i < this.outputDim; i++) {
                    this.bias[i] -= learningRate * gradients.dBias[i];
                }
            }
        }
    }

    // Get layer parameters
    getParameters(): { weights: number[][], bias: number[] } {
        return {
            weights: this.weights.map(row => [...row]),
            bias: [...this.bias]
        };
    }

    // Set layer parameters
    setParameters(parameters: { weights: number[][], bias: number[] }): void {
        this.weights = parameters.weights.map(row => [...row]);
        this.bias = [...parameters.bias];
    }

    // Reinitialize weights using current initializer or a new one
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