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