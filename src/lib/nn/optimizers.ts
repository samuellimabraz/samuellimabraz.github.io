/**
 * Interface for gradient information
 */
export interface Gradients {
    /**
     * Gradients with respect to weights
     */
    dWeights: number[][];

    /**
     * Gradients with respect to bias
     */
    dBias: number[];
}

/**
 * Common configuration for optimizers
 */
export interface OptimizerConfig {
    /**
     * Learning rate controls the step size in parameter updates
     */
    learningRate: number;

    /**
     * Small constant for numerical stability
     */
    epsilon?: number;

    /**
     * L2 regularization factor
     */
    weightDecay?: number;

    /**
     * Initial value for accumulators (for Adagrad)
     */
    initialAccumulatorValue?: number;
}

/**
 * Interface for optimization algorithms
 */
export interface Optimizer {
    /**
     * Update parameters using computed gradients
     * @param weights Current weights
     * @param bias Current bias values
     * @param gradients Computed gradients
     * @returns Object containing new weights and bias values
     */
    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    };

    /**
     * Get the optimizer configuration
     * @returns Configuration object
     */
    getConfig(): OptimizerConfig;
}

/**
 * Stochastic Gradient Descent (SGD) optimizer
 * Standard optimization algorithm that updates parameters
 * in the direction of the negative gradient
 */
export class SGDOptimizer implements Optimizer {
    private learningRate: number;
    private momentum: number;
    private vWeights: number[][][] = [];
    private vBias: number[][] = [];

    /**
     * Create a new SGD optimizer
     * @param learningRate Learning rate (default: 0.01)
     * @param momentum Momentum factor to accelerate learning (default: 0)
     */
    constructor(learningRate: number = 0.01, momentum: number = 0) {
        this.learningRate = learningRate;
        this.momentum = momentum;
    }

    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    } {
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

/**
 * RMSProp Optimizer
 * Maintains a moving average of squared gradients to normalize the gradient
 * Helps with non-stationary objectives and noisy gradients
 */
export class RMSPropOptimizer implements Optimizer {
    private learningRate: number;
    private decay: number;
    private epsilon: number;
    private cache: { weights: number[][], bias: number[] }[] = [];

    /**
     * Create a new RMSProp optimizer
     * @param learningRate Learning rate (default: 0.001)
     * @param decay Decay rate for moving average (default: 0.9)
     * @param epsilon Small constant for numerical stability (default: 1e-8)
     */
    constructor(learningRate: number = 0.001, decay: number = 0.9, epsilon: number = 1e-8) {
        this.learningRate = learningRate;
        this.decay = decay;
        this.epsilon = epsilon;
    }

    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    } {
        if (this.cache.length === 0) {
            this.cache = [{
                weights: weights.map(row => Array(row.length).fill(0)),
                bias: Array(bias.length).fill(0)
            }];
        }

        const newWeights = weights.map((row, i) => {
            return row.map((w, j) => {
                this.cache[0].weights[i][j] = this.decay * this.cache[0].weights[i][j] +
                    (1 - this.decay) * Math.pow(gradients.dWeights[i][j], 2);

                return w - (this.learningRate / Math.sqrt(this.cache[0].weights[i][j] + this.epsilon)) *
                    gradients.dWeights[i][j];
            });
        });

        const newBias = bias.map((b, i) => {
            this.cache[0].bias[i] = this.decay * this.cache[0].bias[i] +
                (1 - this.decay) * Math.pow(gradients.dBias[i], 2);

            return b - (this.learningRate / Math.sqrt(this.cache[0].bias[i] + this.epsilon)) *
                gradients.dBias[i];
        });

        return { newWeights, newBias };
    }

    getConfig(): OptimizerConfig {
        return { learningRate: this.learningRate };
    }
}

/**
 * Adam Optimizer (Adaptive Moment Estimation)
 * Combines ideas from RMSProp and momentum optimization
 * Maintains both first and second moments of gradients 
 */
export class AdamOptimizer implements Optimizer {
    private learningRate: number;
    private beta1: number;
    private beta2: number;
    private epsilon: number;
    private iteration: number = 0;
    private m: { weights: number[][], bias: number[] }[] = [];
    private v: { weights: number[][], bias: number[] }[] = [];

    /**
     * Create a new Adam optimizer
     * @param learningRate Learning rate (default: 0.001)
     * @param beta1 Exponential decay rate for first moment (default: 0.9)
     * @param beta2 Exponential decay rate for second moment (default: 0.999)
     * @param epsilon Small constant for numerical stability (default: 1e-8)
     */
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
                this.m[0].weights[i][j] = this.beta1 * this.m[0].weights[i][j] +
                    (1 - this.beta1) * gradients.dWeights[i][j];

                this.v[0].weights[i][j] = this.beta2 * this.v[0].weights[i][j] +
                    (1 - this.beta2) * Math.pow(gradients.dWeights[i][j], 2);

                return w - alpha * this.m[0].weights[i][j] /
                    (Math.sqrt(this.v[0].weights[i][j]) + this.epsilon);
            });
        });

        const newBias = bias.map((b, i) => {
            this.m[0].bias[i] = this.beta1 * this.m[0].bias[i] +
                (1 - this.beta1) * gradients.dBias[i];

            this.v[0].bias[i] = this.beta2 * this.v[0].bias[i] +
                (1 - this.beta2) * Math.pow(gradients.dBias[i], 2);

            return b - alpha * this.m[0].bias[i] /
                (Math.sqrt(this.v[0].bias[i]) + this.epsilon);
        });

        return { newWeights, newBias };
    }

    getConfig(): OptimizerConfig {
        return {
            learningRate: this.learningRate,
            epsilon: this.epsilon
        };
    }
}

/**
 * Adagrad Optimizer
 * Adapts learning rates based on historical gradient information
 * Good for sparse data but can suffer from aggressive learning rate decay
 */
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
        if (this.cache.weights.length === 0) {
            this.cache = {
                weights: weights.map(row => Array(row.length).fill(this.initialAccumulatorValue)),
                bias: Array(bias.length).fill(this.initialAccumulatorValue)
            };
        }

        const newWeights = weights.map((row, i) => {
            return row.map((w, j) => {
                // L2 regularization/weight decay
                let dw = gradients.dWeights[i][j];
                if (this.weightDecay > 0) {
                    dw += this.weightDecay * w;
                }

                // G_t,i = G_t-1,i + g_t,i^2
                this.cache.weights[i][j] += Math.pow(dw, 2);

                // θ_t+1,i = θ_t,i - (η / sqrt(G_t,i) + ε) * g_t,i
                return w - (this.learningRate / Math.sqrt(this.cache.weights[i][j] + this.epsilon)) * dw;
            });
        });

        const newBias = bias.map((b, i) => {
            // Apply L2 regularization/weight decay
            let db = gradients.dBias[i];
            if (this.weightDecay > 0) {
                db += this.weightDecay * b;
            }

            this.cache.bias[i] += Math.pow(db, 2);

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

/**
 * VSGD (Variational Stochastic Gradient Descent) 
 */
export interface VSGDConfig extends OptimizerConfig {
    /**
     * Prior variance ratio between ghat and g
     */
    ghattg: number;

    /**
     * Prior strength
     */
    ps: number;

    /**
     * Remember rate for gamma parameters of g
     */
    tau1: number;

    /**
     * Remember rate for gamma parameter of ghat
     */
    tau2: number;

    /**
     * Small constant for numerical stability
     */
    epsilon: number;
}

/**
 * VSGD (Variational Stochastic Gradient Descent) Optimizer
 */
export class VSGDOptimizer implements Optimizer {
    private learningRate: number;
    private weightDecay: number;
    private epsilon: number;
    private ghattg: number;
    private ps: number;
    private tau1: number;
    private tau2: number;

    private state: {
        mug: number[][];          // posterior mean gradient for weights
        mugBias: number[];        // posterior mean gradient for bias
        bg: number[][];           // precision parameter for weights
        bgBias: number[];         // precision parameter for bias
        bhg: number[][];          // precision parameter for observation for weights
        bhgBias: number[];        // precision parameter for observation for bias
        pa2: number;              // 2*a_0 constant (shape parameter)
        pbg2: number;             // 2*b_0 constant for g
        pbhg2: number;            // 2*b_0 constant for ghat
        step: number;             // iteration counter
    };

    constructor(
        learningRate: number = 0.1,
        ghattg: number = 30.0,
        ps: number = 1e-8,
        tau1: number = 0.81,
        tau2: number = 0.9,
        weightDecay: number = 0,
        epsilon: number = 1e-8
    ) {
        this.learningRate = learningRate;
        this.ghattg = ghattg;
        this.ps = ps;
        this.tau1 = tau1;
        this.tau2 = tau2;
        this.weightDecay = weightDecay;
        this.epsilon = epsilon;

        this.state = {
            mug: [],
            mugBias: [],
            bg: [],
            bgBias: [],
            bhg: [],
            bhgBias: [],
            pa2: 2.0 * ps + 1.0 + 1e-4,
            pbg2: 2.0 * ps,
            pbhg2: 2.0 * ghattg * ps,
            step: 0
        };
    }

    update(weights: number[][], bias: number[], gradients: Gradients): {
        newWeights: number[][],
        newBias: number[]
    } {
        if (this.state.mug.length === 0) {
            this.initializeState(weights, bias);
        }

        this.state.step += 1;

        const newWeights = this.updateParameters(weights, gradients.dWeights,
            this.state.mug, this.state.bg, this.state.bhg);

        const newBias = this.updateBiasParameters(bias, gradients.dBias,
            this.state.mugBias, this.state.bgBias, this.state.bhgBias);

        return { newWeights, newBias };
    }

    private initializeState(weights: number[][], bias: number[]): void {
        this.state.mug = weights.map(row => Array(row.length).fill(0));
        this.state.bg = weights.map(row => Array(row.length).fill(0));
        this.state.bhg = weights.map(row => Array(row.length).fill(0));

        this.state.mugBias = Array(bias.length).fill(0);
        this.state.bgBias = Array(bias.length).fill(0);
        this.state.bhgBias = Array(bias.length).fill(0);
    }

    private updateParameters(
        params: number[][],
        grads: number[][],
        mug: number[][],
        bg: number[][],
        bhg: number[][]
    ): number[][] {
        const newParams = params.map((row, i) => {
            return row.map((param, j) => {
                const mug1 = mug[i][j];

                // Apply weight decay
                const paramDecayed = param * (1 - this.learningRate * this.weightDecay);

                // Calculate variances of g and ghat
                let sg: number, shg: number;
                if (this.state.step === 1) {
                    sg = this.state.pbg2 / (this.state.pa2 - 1.0);
                    shg = this.state.pbhg2 / (this.state.pa2 - 1.0);
                } else {
                    sg = bg[i][j] / this.state.pa2;
                    shg = bhg[i][j] / this.state.pa2;
                }

                mug[i][j] = (grads[i][j] * sg + mug1 * shg) / (sg + shg);
                /**
                 * This is the heart of VSGD: a weighted average
                 * grads[i][j]: The observed gradient we just got
                 * mug1: Our previous estimate of the true gradient
                 * The weights are inversely proportional to the variances:
                 * If the observed gradient looks more reliable (small sg), we give it more weight
                 * If our previous estimate looks more reliable (small shg), we give it more weight
                 */

                // Calculate posterior variance
                const sigg = sg * shg / (sg + shg);

                // Update 2*b parameters
                const mugSq = sigg + Math.pow(mug[i][j], 2); // Second-order moment (expectation of the square of the gradient)
                const bg2 = this.state.pbg2 + mugSq - 2.0 * mug[i][j] * mug1 + Math.pow(mug1, 2); // New estimate of the accuracy of the true gradient
                const bhg2 = this.state.pbhg2 + mugSq - 2.0 * grads[i][j] * mug[i][j] + Math.pow(grads[i][j], 2); // New estimate of the accuracy of the observed gradient

                // Calculate decay rates
                const rho1 = Math.pow(this.state.step, -this.tau1);
                const rho2 = Math.pow(this.state.step, -this.tau2);

                // Update bg and bhg with exponentially weighted averages
                bg[i][j] = bg[i][j] * (1.0 - rho1) + bg2 * rho1;
                bhg[i][j] = bhg[i][j] * (1.0 - rho2) + bhg2 * rho2;
                /**
                 * The decay rates (rho1 and rho2) decrease over time
                 * This means that the algorithm gives less weight to new evidence as it progresses
                 * tau1 and tau2 control how quickly the rates decrease
                 */

                return paramDecayed - this.learningRate * mug[i][j] / (Math.sqrt(mugSq) + this.epsilon);
            });
        });

        return newParams;
    }

    private updateBiasParameters(
        biasParams: number[],
        biasGrads: number[],
        mugBias: number[],
        bgBias: number[],
        bhgBias: number[]
    ): number[] {
        const newBias = biasParams.map((param, i) => {
            const mug1 = mugBias[i];

            const paramDecayed = param * (1 - this.learningRate * this.weightDecay);

            let sg: number, shg: number;
            if (this.state.step === 1) {
                sg = this.state.pbg2 / (this.state.pa2 - 1.0);
                shg = this.state.pbhg2 / (this.state.pa2 - 1.0);
            } else {
                sg = bgBias[i] / this.state.pa2;
                shg = bhgBias[i] / this.state.pa2;
            }

            mugBias[i] = (biasGrads[i] * sg + mug1 * shg) / (sg + shg);

            const sigg = sg * shg / (sg + shg);

            const mugSq = sigg + Math.pow(mugBias[i], 2);
            const bg2 = this.state.pbg2 + mugSq - 2.0 * mugBias[i] * mug1 + Math.pow(mug1, 2);
            const bhg2 = this.state.pbhg2 + mugSq - 2.0 * biasGrads[i] * mugBias[i] + Math.pow(biasGrads[i], 2);

            const rho1 = Math.pow(this.state.step, -this.tau1);
            const rho2 = Math.pow(this.state.step, -this.tau2);

            bgBias[i] = bgBias[i] * (1.0 - rho1) + bg2 * rho1;
            bhgBias[i] = bhgBias[i] * (1.0 - rho2) + bhg2 * rho2;

            return paramDecayed - this.learningRate * mugBias[i] / (Math.sqrt(mugSq) + this.epsilon);
        });

        return newBias;
    }

    getConfig(): VSGDConfig {
        return {
            learningRate: this.learningRate,
            ghattg: this.ghattg,
            ps: this.ps,
            tau1: this.tau1,
            tau2: this.tau2,
            weightDecay: this.weightDecay,
            epsilon: this.epsilon
        };
    }
}

/**
 * Factory function to get an optimizer by name
 * @param name Name of the optimizer
 * @param config Configuration for the optimizer
 * @returns The configured optimizer instance
 */
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
        case 'vsgd':
            const vsgdConfig = config as Partial<VSGDConfig>;
            return new VSGDOptimizer(
                learningRate,
                vsgdConfig.ghattg || 30.0,
                vsgdConfig.ps || 1e-8,
                vsgdConfig.tau1 || 0.81,
                vsgdConfig.tau2 || 0.9,
                vsgdConfig.weightDecay || 0,
                vsgdConfig.epsilon || 1e-8
            );
        default:
            return new SGDOptimizer(learningRate);
    }
}
