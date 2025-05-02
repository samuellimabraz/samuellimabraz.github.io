import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Play, RefreshCw } from 'lucide-react';
import {
    NNPlaygroundController,
    NetworkConfig,
    TrainingConfig,
    VisualizationElements
} from '../lib/nn';

// Type definitions
type ActivationFunction = 'sigmoid' | 'relu' | 'tanh' | 'linear';
type DataFunction = 'saddle' | 'rosenbrock' | 'sine' | 'circle';

interface DataConfig {
    dataFunction: DataFunction;
    samples: number;
    testRatio: number;
    xRange: [number, number];
    yRange: [number, number];
}

const NNPlayground: React.FC = () => {
    // Refs for visualization elements
    const plot3dRef = useRef<HTMLDivElement>(null);
    const lossPlotRef = useRef<HTMLDivElement>(null);
    const contourPlotRef = useRef<HTMLDivElement>(null);

    // Controller ref
    const controllerRef = useRef<NNPlaygroundController | null>(null);

    // CSS para animação de pulso
    const pulseStyle = `
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        .pulse-animation {
            animation: pulse 1.5s infinite;
        }
    `;

    // State variables for configurations
    const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
        inputDim: 2,
        hiddenDims: [10, 5],
        outputDim: 1,
        hiddenActivations: ['tanh', 'tanh'],
        outputActivation: 'linear',
        useBias: true,
    });

    const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
        learningRate: 0.01,
        numEpochs: 1000,
        batchSize: 32,
        noise: 0.1,
    });

    const [dataConfig, setDataConfig] = useState<DataConfig>({
        dataFunction: 'saddle',
        samples: 1000,
        testRatio: 0.1,
        xRange: [-3, 3],
        yRange: [-3, 3],
    });

    // State for animation control
    const [isTraining, setIsTraining] = useState(false);
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [progress, setProgress] = useState(0);

    // Check if Plotly is available
    const [plotlyAvailable, setPlotlyAvailable] = useState(false);

    // Initialize when component mounts
    useEffect(() => {
        // Check if Plotly is available
        if (typeof window !== 'undefined' && (window as any).Plotly) {
            setPlotlyAvailable(true);
        } else {
            // Load Plotly
            const script = document.createElement('script');
            script.src = 'https://cdn.plot.ly/plotly-2.26.0.min.js';
            script.async = true;
            script.onload = () => setPlotlyAvailable(true);
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, []);

    // Initialize neural network playground when Plotly is available
    useEffect(() => {
        if (plotlyAvailable && plot3dRef.current && lossPlotRef.current && contourPlotRef.current) {
            // Create controller
            controllerRef.current = new NNPlaygroundController();

            // Set visual elements
            controllerRef.current.setVisualElements({
                plot3dDiv: plot3dRef.current,
                lossPlotDiv: lossPlotRef.current,
                contourPlotDiv: contourPlotRef.current
            });

            // Update configurations
            controllerRef.current.updateNetworkConfig(networkConfig);
            controllerRef.current.updateTrainingConfig(trainingConfig);
            controllerRef.current.updateDataConfig(dataConfig);

            // Initialize the playground
            controllerRef.current.initialize();
        }
    }, [plotlyAvailable]);

    // Add window resize handler to resize plots
    useEffect(() => {
        const handleResize = () => {
            if (plotlyAvailable && typeof window !== 'undefined' && (window as any).Plotly) {
                // Request animation frame to ensure DOM has updated
                window.requestAnimationFrame(() => {
                    if (plot3dRef.current) {
                        (window as any).Plotly.Plots.resize(plot3dRef.current);
                    }
                    if (lossPlotRef.current) {
                        (window as any).Plotly.Plots.resize(lossPlotRef.current);
                    }
                    if (contourPlotRef.current) {
                        (window as any).Plotly.Plots.resize(contourPlotRef.current);
                    }
                });
            }
        };

        window.addEventListener('resize', handleResize);

        // Initial resize after a short delay to ensure plots are initialized
        const timeoutId = setTimeout(handleResize, 500);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [plotlyAvailable]);

    // Update controller when configurations change
    useEffect(() => {
        if (controllerRef.current) {
            controllerRef.current.updateNetworkConfig(networkConfig);
        }
    }, [networkConfig]);

    useEffect(() => {
        if (controllerRef.current) {
            controllerRef.current.updateTrainingConfig(trainingConfig);
        }
    }, [trainingConfig]);

    useEffect(() => {
        if (controllerRef.current) {
            controllerRef.current.updateDataConfig(dataConfig);
            // Reinitialize immediately when data function changes
            controllerRef.current.reset();
        }
    }, [dataConfig]);

    // Effect to periodically sync state with controller during training
    useEffect(() => {
        if (isTraining) {
            const syncInterval = setInterval(() => {
                if (controllerRef.current) {
                    const state = controllerRef.current.getState();
                    // Only update if there's a mismatch to avoid unnecessary renders
                    if (state.isTraining !== isTraining) {
                        setIsTraining(state.isTraining);
                    }
                }
            }, 500); // Check every 500ms

            return () => clearInterval(syncInterval);
        }
    }, [isTraining]);

    // Function to start training
    const startTraining = () => {
        if (controllerRef.current) {
            setIsTraining(true);
            setCurrentEpoch(0);
            setProgress(0);

            // Start training
            controllerRef.current.startTraining((epoch, loss, progress) => {
                setCurrentEpoch(epoch);
                setProgress(progress);
            }).then(() => {
                // Training complete
                if (controllerRef.current) {
                    const state = controllerRef.current.getState();
                    setIsTraining(state.isTraining);
                } else {
                    // Fallback if controller is somehow unavailable
                    setIsTraining(false);
                }
            }).catch(error => {
                console.error('Training error:', error);
                setIsTraining(false);
            });
        }
    };

    // Function to reset the playground
    const resetPlayground = () => {
        if (controllerRef.current) {
            // Force cancel any ongoing training
            setIsTraining(false);
            setCurrentEpoch(0);
            setProgress(0);

            // Reset playground - this recreates the network and data
            controllerRef.current.reset();

            // After reset, immediately sync state with controller again to ensure UI is updated
            const state = controllerRef.current.getState();
            if (state.isTraining !== isTraining) {
                setIsTraining(state.isTraining);
            }
            if (state.currentEpoch !== currentEpoch) {
                setCurrentEpoch(state.currentEpoch);
            }
            if (state.progress !== progress) {
                setProgress(state.progress);
            }
        }
    };

    // Function to update network configuration
    const updateNetworkConfig = (key: keyof NetworkConfig, value: any) => {
        setNetworkConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Function to update training configuration
    const updateTrainingConfig = (key: keyof TrainingConfig, value: any) => {
        setTrainingConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Function to update data configuration
    const updateDataConfig = (key: keyof DataConfig, value: any) => {
        setDataConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Function to handle hidden layer dimensions change
    const handleLayerDimChange = (index: number, value: number) => {
        if (!isNaN(value) && value > 0) {
            const newHiddenDims = [...networkConfig.hiddenDims];
            newHiddenDims[index] = value;
            updateNetworkConfig('hiddenDims', newHiddenDims);
        }
    };

    // Function to handle hidden layer activation change
    const handleLayerActivationChange = (index: number, value: ActivationFunction) => {
        const newHiddenActivations = [...networkConfig.hiddenActivations];
        newHiddenActivations[index] = value;
        updateNetworkConfig('hiddenActivations', newHiddenActivations);
    };

    // Function to add a new hidden layer
    const addHiddenLayer = () => {
        const newHiddenDims = [...networkConfig.hiddenDims, 5];
        const newHiddenActivations = [...networkConfig.hiddenActivations, 'tanh'];
        setNetworkConfig(prev => ({
            ...prev,
            hiddenDims: newHiddenDims,
            hiddenActivations: newHiddenActivations
        }));
    };

    // Function to remove a hidden layer
    const removeHiddenLayer = (index: number) => {
        if (networkConfig.hiddenDims.length > 1) {
            const newHiddenDims = [...networkConfig.hiddenDims];
            newHiddenDims.splice(index, 1);

            const newHiddenActivations = [...networkConfig.hiddenActivations];
            newHiddenActivations.splice(index, 1);

            setNetworkConfig(prev => ({
                ...prev,
                hiddenDims: newHiddenDims,
                hiddenActivations: newHiddenActivations
            }));
        }
    };

    return (
        <div className="flex flex-col">
            {/* Adicionar o estilo de pulso */}
            <style>{pulseStyle}</style>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Configuration Panel */}
                <div className="bg-white p-4 rounded-lg shadow lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Sliders className="mr-2 h-5 w-5" /> Configuration
                    </h3>

                    {/* Network Configuration */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">Network Architecture</h4>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">Hidden Layers</label>
                            <div className="space-y-2">
                                {networkConfig.hiddenDims.map((dim, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-20 px-3 py-2 border rounded-md"
                                            value={dim}
                                            onChange={(e) => handleLayerDimChange(index, parseInt(e.target.value))}
                                        />
                                        <span className="text-sm text-gray-500">neurons</span>

                                        <select
                                            className="flex-1 px-3 py-2 border rounded-md"
                                            value={networkConfig.hiddenActivations[index] || 'tanh'}
                                            onChange={(e) => handleLayerActivationChange(index, e.target.value as ActivationFunction)}
                                        >
                                            <option value="sigmoid">Sigmoid</option>
                                            <option value="relu">ReLU</option>
                                            <option value="tanh">Tanh</option>
                                            <option value="linear">Linear</option>
                                        </select>

                                        <button
                                            className="p-1 text-red-500 hover:text-red-700"
                                            onClick={() => removeHiddenLayer(index)}
                                            disabled={networkConfig.hiddenDims.length <= 1}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                                    onClick={addHiddenLayer}
                                >
                                    + Add Layer
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">Output Activation</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={networkConfig.outputActivation}
                                onChange={(e) => updateNetworkConfig('outputActivation', e.target.value)}
                            >
                                <option value="sigmoid">Sigmoid</option>
                                <option value="relu">ReLU</option>
                                <option value="tanh">Tanh</option>
                                <option value="linear">Linear</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="useBias"
                                className="mr-2"
                                checked={networkConfig.useBias}
                                onChange={(e) => updateNetworkConfig('useBias', e.target.checked)}
                            />
                            <label htmlFor="useBias" className="text-sm text-gray-600">Use Bias</label>
                        </div>
                    </div>

                    {/* Training Configuration */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">Training Parameters</h4>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">
                                Learning Rate: {trainingConfig.learningRate}
                            </label>
                            <input
                                type="range"
                                min="0.0001"
                                max="0.1"
                                step="0.0001"
                                className="w-full"
                                value={trainingConfig.learningRate}
                                onChange={(e) => updateTrainingConfig('learningRate', parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">
                                Epochs: {trainingConfig.numEpochs}
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="5000"
                                step="100"
                                className="w-full"
                                value={trainingConfig.numEpochs}
                                onChange={(e) => updateTrainingConfig('numEpochs', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">
                                Batch Size: {trainingConfig.batchSize}
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="128"
                                step="8"
                                className="w-full"
                                value={trainingConfig.batchSize}
                                onChange={(e) => updateTrainingConfig('batchSize', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">
                                Noise: {trainingConfig.noise}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="0.5"
                                step="0.01"
                                className="w-full"
                                value={trainingConfig.noise}
                                onChange={(e) => updateTrainingConfig('noise', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Data Configuration */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">Data</h4>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">Function</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={dataConfig.dataFunction}
                                onChange={(e) => updateDataConfig('dataFunction', e.target.value)}
                            >
                                <option value="saddle">Saddle Function</option>
                                <option value="rosenbrock">Rosenbrock Function</option>
                                <option value="sine">Sine Wave</option>
                                <option value="circle">Circle Function</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">
                                Samples: {dataConfig.samples}
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="5000"
                                step="100"
                                className="w-full"
                                value={dataConfig.samples}
                                onChange={(e) => updateDataConfig('samples', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex space-x-2">
                        <button
                            className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center text-white 
                                ${isTraining
                                    ? 'bg-gray-500'
                                    : 'bg-blue-500 hover:bg-blue-600 pulse-animation'
                                }
                            `}
                            onClick={startTraining}
                            disabled={isTraining}
                        >
                            <>
                                <Play className="mr-1 h-4 w-4" /> {isTraining ? 'Training...' : 'Start Training'}
                            </>
                        </button>

                        <button
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center justify-center"
                            onClick={resetPlayground}
                        >
                            <RefreshCw className="mr-1 h-4 w-4" /> Restart
                        </button>
                    </div>
                </div>

                {/* Visualization Panel */}
                <div className="bg-white p-4 rounded-lg shadow lg:col-span-3 flex flex-col h-full">
                    {/* Modified layout to ensure visualizations stay in their containers */}
                    <div className="flex flex-col space-y-4 flex-grow">
                        {/* 3D Plot - Full width container with increased height */}
                        <div className="w-full h-80 md:h-96 lg:h-[420px] rounded-lg border border-gray-100 overflow-hidden" ref={plot3dRef}>
                            {!plotlyAvailable && (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-gray-500">Loading visualization...</p>
                                </div>
                            )}
                        </div>

                        {/* Container for Loss and Accuracy Plots side by side with increased height */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                            {/* Loss Plot - Increased height */}
                            <div className="h-64 lg:h-72 rounded-lg border border-gray-100 overflow-hidden" ref={lossPlotRef}>
                                {!plotlyAvailable && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p className="text-gray-500">Loading visualization...</p>
                                    </div>
                                )}
                            </div>

                            {/* Accuracy Plot - Increased height */}
                            <div className="h-64 lg:h-72 rounded-lg border border-gray-100 overflow-hidden" ref={contourPlotRef}>
                                {!plotlyAvailable && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p className="text-gray-500">Loading visualization...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Training Progress */}
                    <div className="mt-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Epoch {currentEpoch} / {trainingConfig.numEpochs}</span>
                            <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NNPlayground; 