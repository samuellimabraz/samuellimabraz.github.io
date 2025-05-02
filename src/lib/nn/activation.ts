// Activation functions for neural networks

// Base interface for activation functions
export interface ActivationFn {
    activate: (x: number[]) => number[];
    derivative: (x: number[]) => number[];
}

// Sigmoid activation function: 1 / (1 + e^(-x))
export class Sigmoid implements ActivationFn {
    activate(x: number[]): number[] {
        return x.map(val => 1 / (1 + Math.exp(-Math.min(Math.max(val, -500), 500))));
    }

    derivative(x: number[]): number[] {
        const activated = this.activate(x);
        return activated.map(a => a * (1 - a));
    }
}

// ReLU activation function: max(0, x)
export class ReLU implements ActivationFn {
    activate(x: number[]): number[] {
        return x.map(val => Math.max(0, val));
    }

    derivative(x: number[]): number[] {
        return x.map(val => val > 0 ? 1 : 0);
    }
}

// Tanh activation function: tanh(x)
export class Tanh implements ActivationFn {
    activate(x: number[]): number[] {
        return x.map(val => Math.tanh(val));
    }

    derivative(x: number[]): number[] {
        return x.map(val => 1 - Math.pow(Math.tanh(val), 2));
    }
}

// Linear activation function: f(x) = x
export class Linear implements ActivationFn {
    activate(x: number[]): number[] {
        return [...x];
    }

    derivative(x: number[]): number[] {
        return x.map(() => 1);
    }
}

// Function to get activation function by name
export function getActivation(name: string): ActivationFn {
    switch (name.toLowerCase()) {
        case 'sigmoid':
            return new Sigmoid();
        case 'relu':
            return new ReLU();
        case 'tanh':
            return new Tanh();
        case 'linear':
            return new Linear();
        default:
            return new Tanh();
    }
} 