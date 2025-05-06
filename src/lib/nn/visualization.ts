import { GeneratedData, GridData, calculateTrueSurface } from './data';
import { TrainingHistory } from './network';

export interface VisualizationElements {
    plot3dDiv: HTMLDivElement;
    lossPlotDiv: HTMLDivElement;
    contourPlotDiv: HTMLDivElement;
}

/**
 * Initialize all visualization plots
 * @param elements DOM elements for visualization
 * @param data Training data
 * @param gridData Grid data for surface plots
 * @param functionName Name of the function being approximated
 */
export function initializeVisualization(
    elements: VisualizationElements,
    data: GeneratedData,
    gridData: GridData,
    functionName: string
) {
    const { plot3dDiv, lossPlotDiv, contourPlotDiv } = elements;

    initialize3DPlot(plot3dDiv, data, gridData, functionName);
    initializeLossPlot(lossPlotDiv);
    initializeAccuracyPlot(contourPlotDiv);
}

/**
 * Initialize the 3D surface plot
 * @param plotDiv Container element
 * @param data Training data
 * @param gridData Grid data for surface plot
 * @param functionName Name of the function being approximated
 */
function initialize3DPlot(
    plotDiv: HTMLDivElement,
    data: GeneratedData,
    gridData: GridData,
    functionName: string
) {
    // Create scatter3d trace for training data
    const scatterTrace = {
        type: 'scatter3d',
        mode: 'markers',
        x: data.X.map(point => point[0]),
        y: data.X.map(point => point[1]),
        z: data.Y.map(point => point[0]),
        marker: {
            size: 3,
            color: 'blue',
            opacity: 0.8
        },
        name: 'Training Data'
    };

    // Calculate true function surface for reference (useful but hidden initially)
    const trueSurface = calculateTrueSurface(functionName, gridData.xGrid, gridData.yGrid);

    // Create true function surface trace
    const trueSurfaceTrace = {
        type: 'surface',
        x: gridData.xGrid[0],
        y: gridData.yGrid.map(row => row[0]),
        z: trueSurface,
        colorscale: 'Earth',
        opacity: 0.5,
        showscale: false,
        name: 'True Function',
        visible: 'legendonly' // Only show if toggled in legend
    };

    // Create empty surface trace for model predictions
    const predictionTrace = {
        type: 'surface',
        x: gridData.xGrid[0],
        y: gridData.yGrid.map(row => row[0]),
        z: Array(gridData.xGrid.length).fill(0).map(() =>
            Array(gridData.xGrid[0].length).fill(0)
        ),
        colorscale: 'Viridis',
        opacity: 0.7,
        showscale: false,
        name: 'Neural Network Prediction',
        visible: true
    };

    // Create 3D plot
    const layout = {
        title: '3D Visualization',
        scene: {
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' },
            zaxis: { title: 'Z' },
            aspectratio: { x: 1.5, y: 1.5, z: 1 },
            camera: {
                eye: { x: 1.8, y: 1.8, z: 0.8 }
            }
        },
        margin: { l: 50, r: 50, b: 50, t: 50 },
        showlegend: true,
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    // For debugging - log information about the grid
    console.log('Initializing 3D plot', {
        xGridShape: `${gridData.xGrid.length}x${gridData.xGrid[0]?.length || 0}`,
        yGridShape: `${gridData.yGrid.length}x${gridData.yGrid[0]?.length || 0}`,
        gridPointsLength: gridData.gridPoints.length,
        dataPointsLength: data.X.length
    });

    // @ts-ignore - Plotly is loaded externally
    Plotly.newPlot(plotDiv, [scatterTrace, predictionTrace, trueSurfaceTrace], layout, {
        responsive: true,
        displayModeBar: true,
        useResizeHandler: true
    });

    // Explicitly set the plot to fit its container
    if ((window as any).Plotly && plotDiv) {
        (window as any).Plotly.Plots.resize(plotDiv);
    }
}

/**
 * Initialize the loss plot
 * @param plotDiv Container element
 */
function initializeLossPlot(plotDiv: HTMLDivElement) {
    // Create empty loss trace
    const lossTrace = {
        type: 'scatter',
        mode: 'lines+markers',
        x: [],
        y: [],
        line: { width: 2, color: 'red' },
        marker: { size: 6, color: 'red' },
        name: 'Training Loss'
    };

    // Create loss plot
    const layout = {
        title: 'Training Loss',
        xaxis: { title: 'Epochs' },
        yaxis: {
            title: 'Loss',
            type: 'log'
        },
        margin: { l: 50, r: 50, b: 50, t: 50 },
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    // @ts-ignore - Plotly is loaded externally
    Plotly.newPlot(plotDiv, [lossTrace], layout, {
        responsive: true,
        displayModeBar: true,
        useResizeHandler: true
    });

    // Explicitly set the plot to fit its container
    if ((window as any).Plotly && plotDiv) {
        (window as any).Plotly.Plots.resize(plotDiv);
    }
}

/**
 * Initialize the accuracy plot
 * @param plotDiv Container element
 */
function initializeAccuracyPlot(plotDiv: HTMLDivElement) {
    // Create empty accuracy traces
    const trainAccuracyTrace = {
        type: 'scatter',
        mode: 'lines+markers',
        x: [],
        y: [],
        line: { width: 2, color: 'blue' },
        marker: { size: 6, color: 'blue' },
        name: 'Training Accuracy'
    };

    const testAccuracyTrace = {
        type: 'scatter',
        mode: 'lines+markers',
        x: [],
        y: [],
        line: { width: 2, color: 'green', dash: 'dash' },
        marker: { size: 6, color: 'green' },
        name: 'Test Accuracy'
    };

    // Create accuracy plot
    const layout = {
        title: 'Model Accuracy',
        xaxis: { title: 'Epochs' },
        yaxis: {
            title: 'Accuracy',
            range: [0, 1],
            tickformat: '.0%'
        },
        margin: { l: 50, r: 50, b: 50, t: 50 },
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    // @ts-ignore - Plotly is loaded externally
    Plotly.newPlot(plotDiv, [trainAccuracyTrace, testAccuracyTrace], layout, {
        responsive: true,
        displayModeBar: true,
        useResizeHandler: true
    });

    // Explicitly set the plot to fit its container
    if ((window as any).Plotly && plotDiv) {
        (window as any).Plotly.Plots.resize(plotDiv);
    }
}

/**
 * Update all visualization elements with current training data
 * @param elements DOM elements for visualization
 * @param history Training history
 * @param gridData Grid data for surface plot
 * @param currentEpoch Current training epoch
 * @param numEpochs Total number of epochs
 */
export function updateVisualization(
    elements: VisualizationElements,
    history: TrainingHistory,
    gridData: GridData,
    currentEpoch: number,
    numEpochs: number
) {
    const { plot3dDiv, lossPlotDiv, contourPlotDiv } = elements;

    // Update 3D plot if we have predictions
    if (history.predictions && history.predictions.length > 0 && history.epochs.length > 0) {
        const vizEpochs = history.epochs.filter((epoch, index) => history.predictions[index] && history.predictions[index].length > 0);
        const vizPredictions = history.predictions.filter(p => p && p.length > 0);

        if (vizEpochs.length > 0 && vizPredictions.length > 0) {
            let targetEpoch = currentEpoch;
            // If currentEpoch is beyond the last epoch with prediction, use the last available one
            if (currentEpoch > vizEpochs[vizEpochs.length - 1]) {
                targetEpoch = vizEpochs[vizEpochs.length - 1];
            }

            let validIndex = vizEpochs.findIndex(e => e === targetEpoch);
            if (validIndex === -1) {
                // Find closest lower epoch if exact not found
                for (let i = vizEpochs.length - 1; i >= 0; i--) {
                    if (vizEpochs[i] <= targetEpoch) {
                        validIndex = i;
                        break;
                    }
                }
            }
            // If still not found (e.g. targetEpoch is before any vizEpoch), use the first available
            if (validIndex === -1 && vizPredictions.length > 0) {
                validIndex = 0;
            }

            if (validIndex !== -1 && vizPredictions[validIndex]) {
                const predictionsForEpoch = vizPredictions[validIndex];

                if (predictionsForEpoch && predictionsForEpoch.length > 0) {
                    const zPredGrid = reshapePredictions(predictionsForEpoch, gridData.xGrid.length);
                    console.log('Updating 3D plot with predictions', {
                        shape: `${zPredGrid.length}x${zPredGrid[0]?.length || 0}`,
                        epochForViz: vizEpochs[validIndex],
                        gridSize: gridData.xGrid.length,
                        numPredictions: predictionsForEpoch.length
                    });
                    try {
                        const plotlyDiv = plot3dDiv as any;
                        if (plotlyDiv.data && plotlyDiv.data[1]) {
                            plotlyDiv.data[1].z = zPredGrid;
                            Plotly.redraw(plot3dDiv);
                        } else {
                            throw new Error('Surface trace not found for update');
                        }
                        if ((window as any).Plotly && plot3dDiv) {
                            (window as any).Plotly.Plots.resize(plot3dDiv);
                        }
                    } catch (error) {
                        console.error('Error updating 3D plot:', error);
                        try {
                            const newData = {
                                type: 'surface',
                                x: gridData.xGrid[0],
                                y: gridData.yGrid.map(row => row[0]),
                                z: zPredGrid,
                                colorscale: 'Viridis',
                                opacity: 0.7,
                                showscale: false,
                                name: 'Neural Network Prediction'
                            };
                            Plotly.deleteTraces(plot3dDiv, 1);
                            Plotly.addTraces(plot3dDiv, newData, 1);
                            console.log('Surface plot recreated successfully');
                        } catch (secondError) {
                            console.error('Failed to recreate surface plot:', secondError);
                        }
                    }
                }
            } else {
                // console.warn("Could not find a valid prediction index for 3D plot update.");
            }
        } else {
            // console.warn("No valid epochs or predictions for 3D plot update.");
        }
    }

    // Update loss plot
    if (history.loss.length > 0) {
        const epochs = history.epochs.slice(0, history.loss.length); // Ensure x and y have same length
        const update = {
            x: [epochs],
            y: [history.loss]
        };
        Plotly.update(lossPlotDiv, update, {}, [0]);
        if ((window as any).Plotly && lossPlotDiv) {
            (window as any).Plotly.Plots.resize(lossPlotDiv);
        }
    }

    // Update accuracy plot
    if (history.trainAccuracy.length > 0) {
        const epochs = history.epochs.slice(0, history.trainAccuracy.length);
        const trainAccuracyUpdate = {
            x: [epochs],
            y: [history.trainAccuracy]
        };
        const testAccuracyUpdate = {
            x: [epochs],
            y: [history.testAccuracy.length === epochs.length ? history.testAccuracy : epochs.map(() => NaN)] // Pad if necessary
        };
        Plotly.update(contourPlotDiv,
            { x: [trainAccuracyUpdate.x[0], testAccuracyUpdate.x[0]], y: [trainAccuracyUpdate.y[0], testAccuracyUpdate.y[0]] },
            {},
            [0, 1]
        );
        if ((window as any).Plotly && contourPlotDiv) {
            (window as any).Plotly.Plots.resize(contourPlotDiv);
        }
    }
}

/**
 * Reshape flat predictions into a 2D grid
 * @param predictions Array of predictions
 * @param gridSize Size of the grid
 * @returns 2D array of predictions
 */
function reshapePredictions(predictions: number[][], gridSize: number): number[][] {
    const result: number[][] = [];

    // Check if we have valid grid size
    if (gridSize <= 0) {
        console.error('Invalid grid size:', gridSize);
        return Array(10).fill(0).map(() => Array(10).fill(0));
    }

    // Check if we have enough predictions to create a grid
    if (predictions.length < gridSize * gridSize) {
        console.error(`Not enough predictions for reshaping: ${predictions.length} < ${gridSize * gridSize}`);
        // Create a dummy grid for visualization
        for (let i = 0; i < gridSize; i++) {
            const row: number[] = [];
            for (let j = 0; j < gridSize; j++) {
                row.push(0);
            }
            result.push(row);
        }
        return result;
    }

    // Log prediction stats for debugging
    console.log('Reshaping predictions', {
        total: predictions.length,
        grid: gridSize,
        expected: gridSize * gridSize,
        firstFewValues: predictions.slice(0, 3).map(p => p[0])
    });

    // Reshape flat array to 2D grid
    for (let i = 0; i < gridSize; i++) {
        const row: number[] = [];
        for (let j = 0; j < gridSize; j++) {
            const index = i * gridSize + j;
            // Ensure we have a valid prediction at this index
            if (index < predictions.length && predictions[index] && predictions[index][0] !== undefined) {
                row.push(predictions[index][0]);
            } else {
                console.warn(`Missing prediction at index ${index}`);
                row.push(0); // Fallback value
            }
        }
        result.push(row);
    }

    return result;
} 