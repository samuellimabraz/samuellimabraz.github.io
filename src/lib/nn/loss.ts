/**
 * Interface for loss functions
 */
export interface Loss {
    /**
     * Compute the loss between predictions and targets
     * @param predictions The predicted values from the network
     * @param targets The target/actual values
     * @returns The computed loss value
     */
    forward(predictions: number[][], targets: number[][]): number;

    /**
     * Compute the gradient of the loss with respect to the predictions
     * @param predictions The predicted values from the network
     * @param targets The target/actual values
     * @returns The gradient of the loss with respect to predictions
     */
    backward(predictions: number[][], targets: number[][]): number[][];

    /**
     * Get the name of the loss function
     */
    getName(): string;
}

/**
 * Mean Squared Error loss function
 * L(y, ŷ) = (1/n) * Σ(y_i - ŷ_i)²
 */
export class MSELoss implements Loss {
    forward(predictions: number[][], targets: number[][]): number {
        let sum = 0;
        let count = 0;

        for (let i = 0; i < predictions.length; i++) {
            for (let j = 0; j < predictions[i].length; j++) {
                sum += Math.pow(predictions[i][j] - targets[i][j], 2);
                count++;
            }
        }

        return count > 0 ? sum / count : 0;
    }

    backward(predictions: number[][], targets: number[][]): number[][] {
        const gradients: number[][] = [];
        const m = predictions.length;

        for (let i = 0; i < m; i++) {
            const outputDim = predictions[i].length;
            gradients.push(Array(outputDim).fill(0));

            for (let j = 0; j < outputDim; j++) {
                // 2 * (pred - target) / n
                gradients[i][j] = 2 * (predictions[i][j] - targets[i][j]) / outputDim;
            }
        }

        return gradients;
    }

    getName(): string {
        return 'mse';
    }
}

/**
 * Cross-Entropy loss function for multi-class classification
 * L(y, ŷ) = -Σ(y_i * log(ŷ_i))
 */
export class CrossEntropyLoss implements Loss {
    private epsilon: number;

    constructor(epsilon: number = 1e-10) {
        this.epsilon = epsilon;
    }

    forward(predictions: number[][], targets: number[][]): number {
        let sum = 0;
        const m = predictions.length;

        for (let i = 0; i < m; i++) {
            const outputDim = predictions[i].length;
            for (let j = 0; j < outputDim; j++) {
                // avoid log(0)
                const clippedPred = Math.max(Math.min(predictions[i][j], 1 - this.epsilon), this.epsilon);
                sum -= targets[i][j] * Math.log(clippedPred);
            }
        }

        return m > 0 ? sum / m : 0;
    }

    backward(predictions: number[][], targets: number[][]): number[][] {
        const gradients: number[][] = [];
        const m = predictions.length;

        for (let i = 0; i < m; i++) {
            const outputDim = predictions[i].length;
            gradients.push(Array(outputDim).fill(0));

            for (let j = 0; j < outputDim; j++) {
                // -target/prediction
                const clippedPred = Math.max(Math.min(predictions[i][j], 1 - this.epsilon), this.epsilon);
                gradients[i][j] = -targets[i][j] / clippedPred;
            }
        }

        return gradients;
    }

    getName(): string {
        return 'cross_entropy';
    }
}

/**
 * Binary Cross-Entropy loss for binary classification
 * L(y, ŷ) = -(y * log(ŷ) + (1-y) * log(1-ŷ))
 */
export class BinaryCrossEntropyLoss implements Loss {
    private epsilon: number;

    constructor(epsilon: number = 1e-10) {
        // Small constant to avoid log(0)
        this.epsilon = epsilon;
    }

    forward(predictions: number[][], targets: number[][]): number {
        let sum = 0;
        let count = 0;

        for (let i = 0; i < predictions.length; i++) {
            for (let j = 0; j < predictions[i].length; j++) {
                const clippedPred = Math.max(Math.min(predictions[i][j], 1 - this.epsilon), this.epsilon);
                sum -= (
                    targets[i][j] * Math.log(clippedPred) +
                    (1 - targets[i][j]) * Math.log(1 - clippedPred)
                );
                count++;
            }
        }

        return count > 0 ? sum / count : 0;
    }

    backward(predictions: number[][], targets: number[][]): number[][] {
        const gradients: number[][] = [];
        const m = predictions.length;

        for (let i = 0; i < m; i++) {
            const outputDim = predictions[i].length;
            gradients.push(Array(outputDim).fill(0));

            for (let j = 0; j < outputDim; j++) {
                const clippedPred = Math.max(Math.min(predictions[i][j], 1 - this.epsilon), this.epsilon);
                // (pred-target)/(pred*(1-pred))
                gradients[i][j] = (clippedPred - targets[i][j]) / (clippedPred * (1 - clippedPred));
            }
        }

        return gradients;
    }

    getName(): string {
        return 'binary_cross_entropy';
    }
}

/**
 * Mean Absolute Error (L1) loss function
 * L(y, ŷ) = (1/n) * Σ|y_i - ŷ_i|
 */
export class MAELoss implements Loss {
    forward(predictions: number[][], targets: number[][]): number {
        let sum = 0;
        let count = 0;

        for (let i = 0; i < predictions.length; i++) {
            for (let j = 0; j < predictions[i].length; j++) {
                sum += Math.abs(predictions[i][j] - targets[i][j]);
                count++;
            }
        }

        return count > 0 ? sum / count : 0;
    }

    backward(predictions: number[][], targets: number[][]): number[][] {
        const gradients: number[][] = [];
        const m = predictions.length;

        for (let i = 0; i < m; i++) {
            const outputDim = predictions[i].length;
            gradients.push(Array(outputDim).fill(0));

            for (let j = 0; j < outputDim; j++) {
                // Gradient of L1 is sign(pred - target)
                gradients[i][j] = predictions[i][j] > targets[i][j] ? 1 : -1;
                if (predictions[i][j] === targets[i][j]) {
                    gradients[i][j] = 0; 
                }
                gradients[i][j] /= outputDim; 
            }
        }

        return gradients;
    }

    getName(): string {
        return 'mae';
    }
}

/**
 * Factory function 
 */
export function getLoss(name: string): Loss {
    switch (name.toLowerCase()) {
        case 'mse':
        case 'mean_squared_error':
            return new MSELoss();
        case 'cross_entropy':
            return new CrossEntropyLoss();
        case 'binary_cross_entropy':
        case 'bce':
            return new BinaryCrossEntropyLoss();
        case 'mae':
        case 'mean_absolute_error':
            return new MAELoss();
        default:
            return new MSELoss(); // Default to MSE
    }
} 