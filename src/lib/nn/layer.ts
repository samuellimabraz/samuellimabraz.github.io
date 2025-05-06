import { ActivationFn } from './activation';
import { WeightInitializer, getInitializer, getInitializerForActivation } from './initializers';
import { Gradients } from './optimizers';

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

    getParameters(): { weights: number[][], bias: number[] } {
        return {
            weights: this.weights.map(row => [...row]),
            bias: [...this.bias]
        };
    }

    setParameters(parameters: { weights: number[][], bias: number[] }): void {
        this.weights = parameters.weights.map(row => [...row]);
        this.bias = [...parameters.bias];
    }

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