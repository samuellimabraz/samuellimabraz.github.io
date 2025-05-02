// Data generation functions for neural network training

// Interface for generated data
export interface GeneratedData {
    X: number[][];  // Input features
    Y: number[][];  // Output values
}

export interface GridData {
    gridPoints: number[][];
    xGrid: number[][];
    yGrid: number[][];
}

// Standard Scaler for data normalization
export class StandardScaler {
    private xMean: number[] = [];
    private xStd: number[] = [];
    private yMean: number[] = [];
    private yStd: number[] = [];
    private isXFit: boolean = false;
    private isYFit: boolean = false;

    // Fit scaler to the data (compute mean and standard deviation)
    fit(X: number[][], Y?: number[][]): void {
        this.fitX(X);
        if (Y) {
            this.fitY(Y);
        }
    }

    // Fit scaler to X features
    fitX(X: number[][]): void {
        if (X.length === 0) return;

        const dims = X[0].length;
        this.xMean = Array(dims).fill(0);
        this.xStd = Array(dims).fill(0);

        // Calculate mean
        for (const x of X) {
            for (let i = 0; i < dims; i++) {
                this.xMean[i] += x[i];
            }
        }

        for (let i = 0; i < dims; i++) {
            this.xMean[i] /= X.length;
        }

        // Calculate standard deviation
        for (const x of X) {
            for (let i = 0; i < dims; i++) {
                this.xStd[i] += Math.pow(x[i] - this.xMean[i], 2);
            }
        }

        for (let i = 0; i < dims; i++) {
            this.xStd[i] = Math.sqrt(this.xStd[i] / X.length);
            // Avoid division by zero
            if (this.xStd[i] === 0) {
                this.xStd[i] = 1;
            }
        }

        this.isXFit = true;
    }

    // Fit scaler to Y values
    fitY(Y: number[][]): void {
        if (Y.length === 0) return;

        const dims = Y[0].length;
        this.yMean = Array(dims).fill(0);
        this.yStd = Array(dims).fill(0);

        // Calculate mean
        for (const y of Y) {
            for (let i = 0; i < dims; i++) {
                this.yMean[i] += y[i];
            }
        }

        for (let i = 0; i < dims; i++) {
            this.yMean[i] /= Y.length;
        }

        // Calculate standard deviation
        for (const y of Y) {
            for (let i = 0; i < dims; i++) {
                this.yStd[i] += Math.pow(y[i] - this.yMean[i], 2);
            }
        }

        for (let i = 0; i < dims; i++) {
            this.yStd[i] = Math.sqrt(this.yStd[i] / Y.length);
            // Avoid division by zero
            if (this.yStd[i] === 0) {
                this.yStd[i] = 1;
            }
        }

        this.isYFit = true;
    }

    // Transform X features (normalize)
    transformX(X: number[][]): number[][] {
        if (!this.isXFit) {
            throw new Error('Scaler not fit for X. Call fitX first.');
        }

        return X.map(x => {
            return x.map((val, i) => (val - this.xMean[i]) / this.xStd[i]);
        });
    }

    // Transform Y values (normalize)
    transformY(Y: number[][]): number[][] {
        if (!this.isYFit) {
            throw new Error('Scaler not fit for Y. Call fitY first.');
        }

        return Y.map(y => {
            return y.map((val, i) => (val - this.yMean[i]) / this.yStd[i]);
        });
    }

    // Inverse transform X features (denormalize)
    inverseTransformX(X: number[][]): number[][] {
        if (!this.isXFit) {
            throw new Error('Scaler not fit for X. Call fitX first.');
        }

        return X.map(x => {
            return x.map((val, i) => val * this.xStd[i] + this.xMean[i]);
        });
    }

    // Inverse transform Y values (denormalize)
    inverseTransformY(Y: number[][]): number[][] {
        if (!this.isYFit) {
            throw new Error('Scaler not fit for Y. Call fitY first.');
        }

        return Y.map(y => {
            return y.map((val, i) => val * this.yStd[i] + this.yMean[i]);
        });
    }

    // Get parameters for later reuse
    getParams(): { xMean: number[], xStd: number[], yMean: number[], yStd: number[] } {
        return {
            xMean: [...this.xMean],
            xStd: [...this.xStd],
            yMean: [...this.yMean],
            yStd: [...this.yStd]
        };
    }

    // Reset the scaler
    reset(): void {
        this.xMean = [];
        this.xStd = [];
        this.yMean = [];
        this.yStd = [];
        this.isXFit = false;
        this.isYFit = false;
    }
}

// Saddle function: f(x, y) = x^2 - y^2
export function saddleFunction(x: number, y: number): number {
    return x * x - y * y;
}

// Rosenbrock function: f(x, y) = (1 - x)^2 + 100 * (y - x^2)^2
export function rosenbrockFunction(x: number, y: number): number {
    return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2);
}

// Sine function: f(x, y) = sin(x) * cos(y)
export function sineFunction(x: number, y: number): number {
    return Math.sin(x) * Math.cos(y);
}

// Circle function: f(x, y) = x^2 + y^2
export function circleFunction(x: number, y: number): number {
    return x * x + y * y;
}

// Get function by name
export function getFunctionByName(name: string): (x: number, y: number) => number {
    switch (name.toLowerCase()) {
        case 'saddle':
            return saddleFunction;
        case 'rosenbrock':
            return rosenbrockFunction;
        case 'sine':
            return sineFunction;
        case 'circle':
            return circleFunction;
        default:
            return saddleFunction;
    }
}

// Generate training data from a function
export function generateData(
    functionName: string,
    samples: number,
    xRange: [number, number] = [-3, 3],
    yRange: [number, number] = [-3, 3],
    noise: number = 0,
): GeneratedData {
    const X: number[][] = [];
    const Y: number[][] = [];

    // Get the function
    const func = getFunctionByName(functionName);

    // Generate random points
    for (let i = 0; i < samples; i++) {
        // Generate random x and y coordinates within the specified ranges
        const x = Math.random() * (xRange[1] - xRange[0]) + xRange[0];
        const y = Math.random() * (yRange[1] - yRange[0]) + yRange[0];

        // Calculate z value with optional noise
        let z = func(x, y);
        if (noise > 0) {
            // Add Gaussian noise
            z += noise * (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
        }

        X.push([x, y]);
        Y.push([z]);
    }

    return { X, Y };
}

// Generate grid data for visualization
export function generateGridData(
    xRange: [number, number] = [-3, 3],
    yRange: [number, number] = [-3, 3],
    gridSize: number = 20,
): GridData {
    const gridPoints: number[][] = [];
    const xGrid: number[][] = [];
    const yGrid: number[][] = [];

    // Create grid lines
    const xValues = Array.from({ length: gridSize }, (_, i) =>
        xRange[0] + (xRange[1] - xRange[0]) * i / (gridSize - 1)
    );

    const yValues = Array.from({ length: gridSize }, (_, i) =>
        yRange[0] + (yRange[1] - yRange[0]) * i / (gridSize - 1)
    );

    // Create meshgrid
    for (let i = 0; i < gridSize; i++) {
        xGrid.push([]);
        yGrid.push([]);

        for (let j = 0; j < gridSize; j++) {
            xGrid[i].push(xValues[j]);
            yGrid[i].push(yValues[i]);
            gridPoints.push([xValues[j], yValues[i]]);
        }
    }

    return { gridPoints, xGrid, yGrid };
}

// Split data into training and testing sets
export function splitTrainTest(
    data: GeneratedData,
    testRatio: number = 0.2
): { trainData: GeneratedData, testData: GeneratedData } {
    const numSamples = data.X.length;
    const numTest = Math.floor(numSamples * testRatio);
    const numTrain = numSamples - numTest;

    // Create shallow copies of the arrays
    const X = [...data.X];
    const Y = [...data.Y];

    // Shuffle the data
    for (let i = X.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [X[i], X[j]] = [X[j], X[i]];
        [Y[i], Y[j]] = [Y[j], Y[i]];
    }

    return {
        trainData: {
            X: X.slice(0, numTrain),
            Y: Y.slice(0, numTrain)
        },
        testData: {
            X: X.slice(numTrain),
            Y: Y.slice(numTrain)
        }
    };
}

// Calculate true function values on a grid
export function calculateTrueSurface(
    functionName: string,
    xGrid: number[][],
    yGrid: number[][]
): number[][] {
    const func = getFunctionByName(functionName);
    const zGrid: number[][] = [];

    for (let i = 0; i < xGrid.length; i++) {
        zGrid.push([]);
        for (let j = 0; j < xGrid[i].length; j++) {
            zGrid[i].push(func(xGrid[i][j], yGrid[i][j]));
        }
    }

    return zGrid;
} 