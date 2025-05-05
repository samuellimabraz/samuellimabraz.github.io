// Weight initialization strategies for neural networks

export interface WeightInitializer {
    initialize(inputDim: number, outputDim: number): number[][];
}

// Helper function to generate random numbers from a standard normal distribution
function randn(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// Random initialization with a custom scale
export class RandomInitializer implements WeightInitializer {
    private scale: number;

    constructor(scale: number = 0.01) {
        this.scale = scale;
    }

    initialize(inputDim: number, outputDim: number): number[][] {
        const weights: number[][] = [];
        for (let i = 0; i < outputDim; i++) {
            weights[i] = Array(inputDim).fill(0).map(() => {
                return (Math.random() * 2 - 1) * this.scale;
            });
        }
        return weights;
    }
}

// He initialization (good for ReLU)
export class HeInitializer implements WeightInitializer {
    initialize(inputDim: number, outputDim: number): number[][] {
        const std = Math.sqrt(2 / inputDim);
        const weights: number[][] = [];
        for (let i = 0; i < outputDim; i++) {
            weights[i] = Array(inputDim).fill(0).map(() => {
                return randn() * std;
            });
        }
        return weights;
    }
}

// Xavier/Glorot initialization (good for Sigmoid, Tanh)
export class XavierInitializer implements WeightInitializer {
    initialize(inputDim: number, outputDim: number): number[][] {
        const std =  Math.sqrt(1.0 / (inputDim + outputDim));

        const weights: number[][] = [];
        for (let i = 0; i < outputDim; i++) {
            weights[i] = Array(inputDim).fill(0).map(() => {
                return randn() * std;
            });
        }
        return weights;
    }
}

// Xavier/Glorot uniform initialization
export class XavierUniformInitializer implements WeightInitializer {
    initialize(inputDim: number, outputDim: number): number[][] {
        const limit = Math.sqrt(6 / (inputDim + outputDim));
        const weights: number[][] = [];
        for (let i = 0; i < outputDim; i++) {
            weights[i] = Array(inputDim).fill(0).map(() => {
                return (Math.random() * 2 - 1) * limit;
            });
        }
        return weights;
    }
}

// Zero initialization
export class ZeroInitializer implements WeightInitializer {
    initialize(inputDim: number, outputDim: number): number[][] {
        const weights: number[][] = [];
        for (let i = 0; i < outputDim; i++) {
            weights[i] = Array(inputDim).fill(0);
        }
        return weights;
    }
}

// Get initializer by name
export function getInitializer(name: string): WeightInitializer {
    switch (name.toLowerCase()) {
        case 'random':
            return new RandomInitializer();
        case 'he':
            return new HeInitializer();
        case 'xavier':
        case 'glorot':
            return new XavierInitializer();
        case 'xavier_uniform':
            return new XavierUniformInitializer();
        case 'zero':
            return new ZeroInitializer();
        default:
            return new HeInitializer(); // Default to He initialization
    }
}

// Helper function to get the appropriate initializer for an activation function
export function getInitializerForActivation(activationType: string): WeightInitializer {
    switch (activationType.toLowerCase()) {
        case 'relu':
            return new HeInitializer();
        case 'sigmoid':
        case 'tanh':
            return new XavierInitializer();
        case 'linear':
            return new RandomInitializer(0.1);
        default:
            return new HeInitializer();
    }
} 