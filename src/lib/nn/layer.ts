import { ActivationFn } from './activation';

export class Layer {
    private inputDim: number;
    private outputDim: number;
    private activation: ActivationFn;
    private useBias: boolean;

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
        seed?: number
    ) {
        this.inputDim = inputDim;
        this.outputDim = outputDim;
        this.activation = activation;
        this.useBias = useBias;
        this.cache = {};

        // Initialize weights and biases
        this.weights = [];
        this.bias = Array(outputDim).fill(0);

        // Initialize weights with He initialization
        const scale = Math.sqrt(2 / inputDim);

        for (let i = 0; i < outputDim; i++) {
            this.weights[i] = Array(inputDim).fill(0).map(() => {
                return (Math.random() * 2 - 1) * scale;
            });
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
    backward(dOutput: number[]): { dInput: number[], gradients: { dWeights: number[][], dBias: number[] } } {
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
    updateParameters(gradients: { dWeights: number[][], dBias: number[] }, learningRate: number): void {
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
} 