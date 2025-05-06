// Optimization algorithms for neural networks

export interface Gradients {
    dWeights: number[][];
    dBias: number[];
}

export interface OptimizerConfig {
    learningRate: number;
    epsilon?: number;
    weightDecay?: number;
    initialAccumulatorValue?: number;
}

export interface Optimizer {
    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    };
    getConfig(): OptimizerConfig;
}

// Stochastic Gradient Descent (SGD)
export class SGDOptimizer implements Optimizer {
    private learningRate: number;
    private momentum: number;
    private vWeights: number[][][] = [];
    private vBias: number[][] = [];

    constructor(learningRate: number = 0.01, momentum: number = 0) {
        this.learningRate = learningRate;
        this.momentum = momentum;
    }

    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    } {
        // Initialize velocity arrays if needed
        if (this.vWeights.length === 0) {
            this.vWeights = [weights.map(row => Array(row.length).fill(0))];
            this.vBias = [Array(bias.length).fill(0)];
        }

        const newWeights = weights.map((row, i) => {
            return row.map((w, j) => {
                // Update velocity with momentum
                if (this.momentum > 0) {
                    this.vWeights[0][i][j] = this.momentum * this.vWeights[0][i][j] -
                        this.learningRate * gradients.dWeights[i][j];
                    return w + this.vWeights[0][i][j];
                } else {
                    // Standard SGD
                    return w - this.learningRate * gradients.dWeights[i][j];
                }
            });
        });

        const newBias = bias.map((b, i) => {
            // Update velocity with momentum
            if (this.momentum > 0) {
                this.vBias[0][i] = this.momentum * this.vBias[0][i] -
                    this.learningRate * gradients.dBias[i];
                return b + this.vBias[0][i];
            } else {
                // Standard SGD
                return b - this.learningRate * gradients.dBias[i];
            }
        });

        return { newWeights, newBias };
    }

    getConfig(): OptimizerConfig {
        return { learningRate: this.learningRate };
    }
}

// RMSProp Optimizer
export class RMSPropOptimizer implements Optimizer {
    private learningRate: number;
    private decay: number;
    private epsilon: number;
    private cache: { weights: number[][], bias: number[] }[] = [];

    constructor(learningRate: number = 0.001, decay: number = 0.9, epsilon: number = 1e-8) {
        this.learningRate = learningRate;
        this.decay = decay;
        this.epsilon = epsilon;
    }

    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    } {
        // Initialize cache if needed
        if (this.cache.length === 0) {
            this.cache = [{
                weights: weights.map(row => Array(row.length).fill(0)),
                bias: Array(bias.length).fill(0)
            }];
        }

        const newWeights = weights.map((row, i) => {
            return row.map((w, j) => {
                // Update cache
                this.cache[0].weights[i][j] = this.decay * this.cache[0].weights[i][j] +
                    (1 - this.decay) * Math.pow(gradients.dWeights[i][j], 2);

                // Update weights
                return w - (this.learningRate / Math.sqrt(this.cache[0].weights[i][j] + this.epsilon)) *
                    gradients.dWeights[i][j];
            });
        });

        const newBias = bias.map((b, i) => {
            // Update cache
            this.cache[0].bias[i] = this.decay * this.cache[0].bias[i] +
                (1 - this.decay) * Math.pow(gradients.dBias[i], 2);

            // Update bias
            return b - (this.learningRate / Math.sqrt(this.cache[0].bias[i] + this.epsilon)) *
                gradients.dBias[i];
        });

        return { newWeights, newBias };
    }

    getConfig(): OptimizerConfig {
        return { learningRate: this.learningRate };
    }
}

// Adam Optimizer
export class AdamOptimizer implements Optimizer {
    private learningRate: number;
    private beta1: number;
    private beta2: number;
    private epsilon: number;
    private iteration: number = 0;
    private m: { weights: number[][], bias: number[] }[] = [];
    private v: { weights: number[][], bias: number[] }[] = [];

    constructor(learningRate: number = 0.001, beta1: number = 0.9, beta2: number = 0.999, epsilon: number = 1e-8) {
        this.learningRate = learningRate;
        this.beta1 = beta1;
        this.beta2 = beta2;
        this.epsilon = epsilon;
    }

    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    } {
        // Initialize momentum and velocity if needed
        if (this.m.length === 0) {
            this.m = [{
                weights: weights.map(row => Array(row.length).fill(0)),
                bias: Array(bias.length).fill(0)
            }];

            this.v = [{
                weights: weights.map(row => Array(row.length).fill(0)),
                bias: Array(bias.length).fill(0)
            }];
        }

        this.iteration += 1;
        const alpha = this.learningRate *
            Math.sqrt(1 - Math.pow(this.beta2, this.iteration)) /
            (1 - Math.pow(this.beta1, this.iteration));

        const newWeights = weights.map((row, i) => {
            return row.map((w, j) => {
                // Update biased first moment estimate
                this.m[0].weights[i][j] = this.beta1 * this.m[0].weights[i][j] +
                    (1 - this.beta1) * gradients.dWeights[i][j];

                // Update biased second raw moment estimate
                this.v[0].weights[i][j] = this.beta2 * this.v[0].weights[i][j] +
                    (1 - this.beta2) * Math.pow(gradients.dWeights[i][j], 2);

                // Update parameters
                return w - alpha * this.m[0].weights[i][j] /
                    (Math.sqrt(this.v[0].weights[i][j]) + this.epsilon);
            });
        });

        const newBias = bias.map((b, i) => {
            // Update biased first moment estimate
            this.m[0].bias[i] = this.beta1 * this.m[0].bias[i] +
                (1 - this.beta1) * gradients.dBias[i];

            // Update biased second raw moment estimate
            this.v[0].bias[i] = this.beta2 * this.v[0].bias[i] +
                (1 - this.beta2) * Math.pow(gradients.dBias[i], 2);

            // Update parameters
            return b - alpha * this.m[0].bias[i] /
                (Math.sqrt(this.v[0].bias[i]) + this.epsilon);
        });

        return { newWeights, newBias };
    }

    getConfig(): OptimizerConfig {
        return { learningRate: this.learningRate };
    }
}

// Adagrad Optimizer
export class AdagradOptimizer implements Optimizer {
    private learningRate: number;
    private epsilon: number;
    private weightDecay: number;
    private initialAccumulatorValue: number;
    private cache: { weights: number[][], bias: number[] };

    constructor(
        learningRate: number = 0.01,
        epsilon: number = 1e-8,
        weightDecay: number = 0,
        initialAccumulatorValue: number = 0
    ) {
        this.learningRate = learningRate;
        this.epsilon = epsilon;
        this.weightDecay = weightDecay;
        this.initialAccumulatorValue = initialAccumulatorValue;
        this.cache = {
            weights: [],
            bias: []
        };
    }

    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    } {
        // Initialize cache if needed with initial accumulator value
        if (this.cache.weights.length === 0) {
            this.cache = {
                weights: weights.map(row => Array(row.length).fill(this.initialAccumulatorValue)),
                bias: Array(bias.length).fill(this.initialAccumulatorValue)
            };
        }

        const newWeights = weights.map((row, i) => {
            return row.map((w, j) => {
                // Apply L2 regularization/weight decay if needed
                let dw = gradients.dWeights[i][j];
                if (this.weightDecay > 0) {
                    dw += this.weightDecay * w;
                }

                // Update cache by accumulating squared gradients
                // G_t,i = G_t-1,i + g_t,i^2
                this.cache.weights[i][j] += Math.pow(dw, 2);

                // Update weights using adaptive learning rate
                // θ_t+1,i = θ_t,i - (η / sqrt(G_t,i) + ε) * g_t,i
                return w - (this.learningRate / Math.sqrt(this.cache.weights[i][j] + this.epsilon)) * dw;
            });
        });

        const newBias = bias.map((b, i) => {
            // Apply L2 regularization/weight decay if needed
            let db = gradients.dBias[i];
            if (this.weightDecay > 0) {
                db += this.weightDecay * b;
            }

            // Update cache by accumulating squared gradients
            this.cache.bias[i] += Math.pow(db, 2);

            // Update bias using adaptive learning rate
            return b - (this.learningRate / Math.sqrt(this.cache.bias[i] + this.epsilon)) * db;
        });

        return { newWeights, newBias };
    }

    getConfig(): OptimizerConfig {
        return {
            learningRate: this.learningRate,
            epsilon: this.epsilon,
            weightDecay: this.weightDecay,
            initialAccumulatorValue: this.initialAccumulatorValue
        };
    }
}

// Factory function to get optimizer by name
export function getOptimizer(name: string, config: Partial<OptimizerConfig> = {}): Optimizer {
    const learningRate = config.learningRate || 0.01;

    switch (name.toLowerCase()) {
        case 'sgd':
            return new SGDOptimizer(learningRate);
        case 'sgd_momentum':
            return new SGDOptimizer(learningRate, 0.9);
        case 'rmsprop':
            return new RMSPropOptimizer(learningRate);
        case 'adam':
            return new AdamOptimizer(learningRate);
        case 'adagrad':
            return new AdagradOptimizer(
                learningRate,
                config.epsilon || 1e-8,
                config.weightDecay || 0,
                config.initialAccumulatorValue || 0
            );
        default:
            return new SGDOptimizer(learningRate);
    }
}
