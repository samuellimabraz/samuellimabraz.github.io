// Visualization functions for neural network playground
// Note: This assumes that Plotly.js is available globally

import { GeneratedData, GridData, calculateTrueSurface } from './data';
import { TrainingHistory } from './network';

export interface VisualizationElements {
    plot3dDiv: HTMLDivElement;
    lossPlotDiv: HTMLDivElement;
    contourPlotDiv: HTMLDivElement;  // Will be used for accuracy plot instead
}

export function initializeVisualization(
    elements: VisualizationElements,
    data: GeneratedData,
    gridData: GridData,
    functionName: string
) {
    const { plot3dDiv, lossPlotDiv, contourPlotDiv } = elements;

    // Create 3D surface plot
    initialize3DPlot(plot3dDiv, data, gridData, functionName);

    // Create empty loss plot
    initializeLossPlot(lossPlotDiv);

    // Create empty accuracy plot (replacing contour plot)
    initializeAccuracyPlot(contourPlotDiv);
}

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
        margin: { l: 50, r: 50, b: 50, t: 50 },  // Increased margins
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
        margin: { l: 50, r: 50, b: 50, t: 50 },  // Increased margins
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

export function updateVisualization(
    elements: VisualizationElements,
    history: TrainingHistory,
    gridData: GridData,
    currentEpoch: number,
    numEpochs: number
) {
    const { plot3dDiv, lossPlotDiv, contourPlotDiv } = elements;

    // Update 3D plot if we have predictions
    if (history.predictions.length > 0) {
        // Find the best prediction to use for the current epoch
        // First try to find the exact epoch
        const exactEpochIndex = history.epochs.indexOf(currentEpoch);

        // If exact epoch isn't found, find the closest lower epoch
        let closestLowerEpochIndex = -1;
        if (exactEpochIndex < 0) {
            for (let i = 0; i < history.epochs.length; i++) {
                if (history.epochs[i] <= currentEpoch &&
                    (closestLowerEpochIndex < 0 || history.epochs[i] > history.epochs[closestLowerEpochIndex])) {
                    closestLowerEpochIndex = i;
                }
            }
        }

        // Use exact match if available, otherwise the closest one, or the last one
        let validIndex: number;
        if (exactEpochIndex >= 0) {
            validIndex = exactEpochIndex;
        } else if (closestLowerEpochIndex >= 0) {
            validIndex = closestLowerEpochIndex;
        } else {
            validIndex = history.predictions.length - 1;
        }

        const predictions = history.predictions[validIndex];

        if (predictions) {
            // Reshape predictions to 2D grid
            const zPredGrid = reshapePredictions(predictions, gridData.xGrid.length);

            // Check if zPredGrid has the correct format
            console.log('Updating 3D plot with predictions', {
                shape: `${zPredGrid.length}x${zPredGrid[0]?.length || 0}`,
                epochIndex: validIndex,
                epoch: history.epochs[validIndex],
                minValue: Math.min(...zPredGrid.flat()),
                maxValue: Math.max(...zPredGrid.flat())
            });

            // Update prediction surface
            try {
                // Instead of using Plotly.update which might not work correctly with surface plots
                // Let's directly update the data source
                // Type assertion to access Plotly's data property on the div
                const plotlyDiv = plot3dDiv as any;
                if (plotlyDiv.data && plotlyDiv.data[1]) {
                    // Update the z values for the surface trace (index 1)
                    plotlyDiv.data[1].z = zPredGrid;

                    // Use Plotly.redraw which is faster and more reliable for surface plots
                    // @ts-ignore - Plotly is loaded externally
                    Plotly.redraw(plot3dDiv);

                    console.log('Surface plot updated successfully using redraw');
                } else {
                    // Fallback to recreating the trace 
                    throw new Error('Surface trace not found, falling back to recreate');
                }

                // Resize plot to fit container
                if ((window as any).Plotly && plot3dDiv) {
                    (window as any).Plotly.Plots.resize(plot3dDiv);
                }
            } catch (error) {
                console.error('Error updating 3D plot:', error);

                // If update fails, try recreating the surface
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

                    // @ts-ignore - Plotly is loaded externally
                    Plotly.deleteTraces(plot3dDiv, 1); // Delete the prediction trace (index 1)
                    // @ts-ignore - Plotly is loaded externally
                    Plotly.addTraces(plot3dDiv, newData, 1); // Add it back at the same index

                    console.log('Surface plot recreated successfully');
                } catch (secondError) {
                    console.error('Failed to recreate surface plot:', secondError);
                }
            }
        }
    }

    // Update loss plot
    if (history.loss.length > 0) {
        const epochs = Array.from({ length: history.loss.length }, (_, i) => i);
        const update = {
            x: [epochs],
            y: [history.loss]
        };

        // @ts-ignore - Plotly is loaded externally
        Plotly.update(lossPlotDiv, update, {}, [0]);

        // Resize plot to fit container
        if ((window as any).Plotly && lossPlotDiv) {
            (window as any).Plotly.Plots.resize(lossPlotDiv);
        }
    }

    // Update accuracy plot (replacing contour plot)
    if (history.trainAccuracy.length > 0) {
        const epochs = Array.from({ length: history.trainAccuracy.length }, (_, i) => i);

        // Prepare update for train accuracy
        const trainAccuracyUpdate = {
            x: [epochs],
            y: [history.trainAccuracy]
        };

        // Prepare update for test accuracy if available
        const testAccuracyUpdate = {
            x: [epochs],
            y: [history.testAccuracy.length > 0 ? history.testAccuracy : []]
        };

        // @ts-ignore - Plotly is loaded externally
        Plotly.update(contourPlotDiv,
            {
                x: [trainAccuracyUpdate.x[0], testAccuracyUpdate.x[0]],
                y: [trainAccuracyUpdate.y[0], testAccuracyUpdate.y[0]]
            },
            {},
            [0, 1]
        );

        // Resize plot to fit container
        if ((window as any).Plotly && contourPlotDiv) {
            (window as any).Plotly.Plots.resize(contourPlotDiv);
        }
    }
}

// Reshape flat predictions to 2D grid
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