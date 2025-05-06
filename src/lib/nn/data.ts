/**
 * Interface for generated data sets
 */
export interface GeneratedData {
    /**
     * Input features matrix where each row is a sample and each column a feature
     */
    X: number[][];

    /**
     * Output values matrix where each row corresponds to a sample
     */
    Y: number[][];
}

/**
 * Interface for grid data used in function visualization
 */
export interface GridData {
    /**
     * Flattened grid points as [x, y] pairs
     */
    gridPoints: number[][];

    /**
     * X-coordinates of the grid
     */
    xGrid: number[][];

    /**
     * Y-coordinates of the grid
     */
    yGrid: number[][];
}

/**
 * StandardScaler for data normalization
 * Normalizes data to have zero mean and unit variance
 */
export class StandardScaler {
    private xMean: number[] = [];
    private xStd: number[] = [];
    private yMean: number[] = [];
    private yStd: number[] = [];
    private isXFit: boolean = false;
    private isYFit: boolean = false;

    /**
     * Fit scaler to both input and output data
     * @param X Input features matrix
     * @param Y Optional output values matrix
     */
    fit(X: number[][], Y?: number[][]): void {
        this.fitX(X);
        if (Y) {
            this.fitY(Y);
        }
    }

    /**
     * Fit scaler to input features
     * @param X Input features matrix
     */
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

        for (const x of X) {
            for (let i = 0; i < dims; i++) {
                this.xStd[i] += Math.pow(x[i] - this.xMean[i], 2);
            }
        }

        for (let i = 0; i < dims; i++) {
            this.xStd[i] = Math.sqrt(this.xStd[i] / X.length)
            if (this.xStd[i] === 0) {
                this.xStd[i] = 1;
            }
        }

        this.isXFit = true;
    }

    /**
     * Fit scaler to output values
     * @param Y Output values matrix
     */
    fitY(Y: number[][]): void {
        if (Y.length === 0) return;

        const dims = Y[0].length;
        this.yMean = Array(dims).fill(0);
        this.yStd = Array(dims).fill(0);

        for (const y of Y) {
            for (let i = 0; i < dims; i++) {
                this.yMean[i] += y[i];
            }
        }

        for (let i = 0; i < dims; i++) {
            this.yMean[i] /= Y.length;
        }

        for (const y of Y) {
            for (let i = 0; i < dims; i++) {
                this.yStd[i] += Math.pow(y[i] - this.yMean[i], 2);
            }
        }

        for (let i = 0; i < dims; i++) {
            this.yStd[i] = Math.sqrt(this.yStd[i] / Y.length);
            if (this.yStd[i] === 0) {
                this.yStd[i] = 1;
            }
        }

        this.isYFit = true;
    }

    /**
     * Transform input features by normalizing them
     * @param X Input features matrix
     * @returns Normalized features
     */
    transformX(X: number[][]): number[][] {
        if (!this.isXFit) {
            throw new Error('Scaler not fit for X. Call fitX first.');
        }

        return X.map(x => {
            return x.map((val, i) => (val - this.xMean[i]) / this.xStd[i]);
        });
    }

    /**
     * Transform output values by normalizing them
     * @param Y Output values matrix
     * @returns Normalized output values
     */
    transformY(Y: number[][]): number[][] {
        if (!this.isYFit) {
            throw new Error('Scaler not fit for Y. Call fitY first.');
        }

        return Y.map(y => {
            return y.map((val, i) => (val - this.yMean[i]) / this.yStd[i]);
        });
    }

    /**
     * Inverse transform input features (denormalize)
     * @param X Normalized input features
     * @returns Original scale features
     */
    inverseTransformX(X: number[][]): number[][] {
        if (!this.isXFit) {
            throw new Error('Scaler not fit for X. Call fitX first.');
        }

        return X.map(x => {
            return x.map((val, i) => val * this.xStd[i] + this.xMean[i]);
        });
    }

    /**
     * Inverse transform output values (denormalize)
     * @param Y Normalized output values
     * @returns Original scale output values
     */
    inverseTransformY(Y: number[][]): number[][] {
        if (!this.isYFit) {
            throw new Error('Scaler not fit for Y. Call fitY first.');
        }

        return Y.map(y => {
            return y.map((val, i) => val * this.yStd[i] + this.yMean[i]);
        });
    }

    /**
     * Get scaling parameters for later reuse
     * @returns Object containing mean and standard deviation values
     */
    getParams(): { xMean: number[], xStd: number[], yMean: number[], yStd: number[] } {
        return {
            xMean: [...this.xMean],
            xStd: [...this.xStd],
            yMean: [...this.yMean],
            yStd: [...this.yStd]
        };
    }

    /**
     * Reset the scaler to its initial state
     */
    reset(): void {
        this.xMean = [];
        this.xStd = [];
        this.yMean = [];
        this.yStd = [];
        this.isXFit = false;
        this.isYFit = false;
    }
}

/**
 * Saddle function: f(x, y) = x^2 - y^2
 * @param x X coordinate
 * @param y Y coordinate
 * @returns Function value at (x,y)
 */
export function saddleFunction(x: number, y: number): number {
    return x * x - y * y;
}

/**
 * Rosenbrock function: f(x, y) = (1 - x)^2 + 100 * (y - x^2)^2
 * Classic optimization test function with a narrow curved valley
 * @param x X coordinate
 * @param y Y coordinate
 * @returns Function value at (x,y)
 */
export function rosenbrockFunction(x: number, y: number): number {
    return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2);
}

/**
 * Sine function: f(x, y) = sin(x) * cos(y)
 * @param x X coordinate
 * @param y Y coordinate
 * @returns Function value at (x,y)
 */
export function sineFunction(x: number, y: number): number {
    return Math.sin(x) * Math.cos(y);
}

/**
 * Circle function: f(x, y) = x^2 + y^2
 * @param x X coordinate
 * @param y Y coordinate
 * @returns Function value at (x,y)
 */
export function circleFunction(x: number, y: number): number {
    return x * x + y * y;
}

/**
 * Get function by name
 * @param name Function name
 * @returns The corresponding function
 */
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
            return sineFunction;
    }
}

/**
 * Generate synthetic data for a 2D function
 * @param functionName Name of the function to generate data for
 * @param samples Number of data points to generate
 * @param xRange Range of x values [min, max]
 * @param yRange Range of y values [min, max]
 * @param noise Amount of Gaussian noise to add
 * @returns Generated data points
 */
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
        const x = Math.random() * (xRange[1] - xRange[0]) + xRange[0];
        const y = Math.random() * (yRange[1] - yRange[0]) + yRange[0];

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

/**
 * Generate a grid for function visualization
 * @param xRange Range of x values [min, max]
 * @param yRange Range of y values [min, max]
 * @param gridSize Number of points in each dimension
 * @returns Grid data structure
 */
export function generateGridData(
    xRange: [number, number] = [-3, 3],
    yRange: [number, number] = [-3, 3],
    gridSize: number = 20,
): GridData {
    const gridPoints: number[][] = [];
    const xGrid: number[][] = [];
    const yGrid: number[][] = [];

    const xValues = Array.from({ length: gridSize }, (_, i) =>
        xRange[0] + (xRange[1] - xRange[0]) * i / (gridSize - 1)
    );

    const yValues = Array.from({ length: gridSize }, (_, i) =>
        yRange[0] + (yRange[1] - yRange[0]) * i / (gridSize - 1)
    );

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

/**
 * Split dataset into training and testing sets
 * @param data Complete dataset
 * @param testRatio Proportion of data to use for testing
 * @returns Object containing training and testing datasets
 */
export function splitTrainTest(
    data: GeneratedData,
    testRatio: number = 0.2
): { trainData: GeneratedData, testData: GeneratedData } {
    const numSamples = data.X.length;
    const numTest = Math.floor(numSamples * testRatio);
    const numTrain = numSamples - numTest;

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

/**
 * Calculate true function values on a grid for visualization
 * @param functionName Name of the function to evaluate
 * @param xGrid X-coordinates grid
 * @param yGrid Y-coordinates grid
 * @returns Matrix of function values
 */
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