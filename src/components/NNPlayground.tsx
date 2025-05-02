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
type WeightInitializer = 'random' | 'he' | 'xavier' | 'xavier_uniform' | 'zero';
type OptimizerType = 'sgd' | 'sgd_momentum' | 'rmsprop' | 'adam' | 'adagrad';

interface DataConfig {
    dataFunction: DataFunction;
    samples: number;
    testRatio: number;
    xRange: [number, number];
    yRange: [number, number];
    useNormalization: boolean;
}

interface LayerConfig {
    neurons: number;
    activation: ActivationFunction;
    initializer: WeightInitializer;
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

    // Layer configuration (separate from NetworkConfig for easier UI management)
    const [layers, setLayers] = useState<LayerConfig[]>([
        { neurons: 89, activation: 'relu', initializer: 'he' },
        { neurons: 16, activation: 'tanh', initializer: 'xavier' }
    ]);

    // State variables for configurations
    const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
        inputDim: 2,
        hiddenDims: [10, 5],
        outputDim: 1,
        hiddenActivations: ['relu', 'tanh'],
        outputActivation: 'linear',
        useBias: true,
        weightInitializer: 'he',
        layerInitializers: ['he', 'xavier', 'he'], // Include output layer
        optimizer: 'adam'
    });

    const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
        learningRate: 0.001,
        numEpochs: 50,
        batchSize: 32,
        noise: 0.1,
    });

    const [dataConfig, setDataConfig] = useState<DataConfig>({
        dataFunction: 'saddle',
        samples: 700,
        testRatio: 0.1,
        xRange: [-3, 3],
        yRange: [-3, 3],
        useNormalization: true
    });

    // State for animation control
    const [isTraining, setIsTraining] = useState(false);
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [progress, setProgress] = useState(0);

    // Output layer configuration
    const [outputLayerConfig, setOutputLayerConfig] = useState<{
        activation: ActivationFunction,
        initializer: WeightInitializer
    }>({
        activation: 'linear',
        initializer: 'he'
    });

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

    // Effect to sync layers with networkConfig
    useEffect(() => {
        // Extract the hidden dimensions and activations from layers
        const hiddenDims = layers.map(layer => layer.neurons);
        const hiddenActivations = layers.map(layer => layer.activation);
        const layerInitializers = [...layers.map(layer => layer.initializer), outputLayerConfig.initializer];

        setNetworkConfig(prev => ({
            ...prev,
            hiddenDims,
            hiddenActivations,
            outputActivation: outputLayerConfig.activation,
            layerInitializers
        }));
    }, [layers, outputLayerConfig]);

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

    // Function to handle layer specific updates
    const handleLayerUpdate = (index: number, key: keyof LayerConfig, value: any) => {
        const newLayers = [...layers];
        newLayers[index] = { ...newLayers[index], [key]: value };
        setLayers(newLayers);

        // If updating initializer, update the controller directly
        if (key === 'initializer' && controllerRef.current) {
            controllerRef.current.setLayerInitializer(index, value as string);
        }
    };

    // Function to update output layer config
    const handleOutputLayerUpdate = (key: keyof typeof outputLayerConfig, value: any) => {
        setOutputLayerConfig(prev => ({
            ...prev,
            [key]: value
        }));

        // If updating initializer, update the controller directly
        if (key === 'initializer' && controllerRef.current) {
            const outputLayerIndex = layers.length; // Output layer is after all hidden layers
            controllerRef.current.setLayerInitializer(outputLayerIndex, value as string);
        }
    };

    // Function to add a new hidden layer
    const addHiddenLayer = () => {
        // Default new layer configuration
        const newLayer: LayerConfig = {
            neurons: 5,
            activation: 'tanh',
            initializer: 'he'
        };
        setLayers([...layers, newLayer]);
    };

    // Function to remove a hidden layer
    const removeHiddenLayer = (index: number) => {
        if (layers.length > 1) {
            const newLayers = [...layers];
            newLayers.splice(index, 1);
            setLayers(newLayers);
        }
    };

    // Function to change optimizer
    const handleOptimizerChange = (value: OptimizerType) => {
        updateNetworkConfig('optimizer', value);

        // Update the controller
        if (controllerRef.current) {
            controllerRef.current.setOptimizer(value);
        }
    };

    return (
        <div className="flex flex-col text-dark-text-secondary">
            {/* Adicionar o estilo de pulso */}
            <style>{pulseStyle}</style>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel - Network Configuration */}
                <div className="bg-dark-secondary p-4 rounded-lg shadow-md shadow-black/5 lg:col-span-3 border border-dark-border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center text-dark-text-primary">
                        <Sliders className="mr-2 h-5 w-5 text-dark-accent" /> Network Architecture
                    </h3>

                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm text-dark-text-secondary">Hidden Layers</label>
                            <button
                                className="px-2 py-1 bg-dark-primary hover:bg-dark-primary/80 rounded text-xs text-dark-text-primary"
                                onClick={addHiddenLayer}
                            >
                                + Add Layer
                            </button>
                        </div>

                        <div className="space-y-4">
                            {layers.map((layer, index) => (
                                <div key={index} className="p-3 border rounded-md bg-dark-primary border-dark-border">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-dark-text-primary">Layer {index + 1}</span>
                                        {layers.length > 1 && (
                                            <button
                                                className="p-1 text-red-400 hover:text-red-300"
                                                onClick={() => removeHiddenLayer(index)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <label className="block text-xs text-dark-text-secondary mb-1">Neurons</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-2 py-1 border rounded-md text-sm bg-dark-secondary border-dark-border text-dark-text-primary"
                                                value={layer.neurons}
                                                onChange={(e) => handleLayerUpdate(index, 'neurons', parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-dark-text-secondary mb-1">Activation</label>
                                            <select
                                                className="w-full px-2 py-1 border rounded-md text-sm bg-dark-secondary border-dark-border text-dark-text-primary"
                                                value={layer.activation}
                                                onChange={(e) => handleLayerUpdate(index, 'activation', e.target.value as ActivationFunction)}
                                            >
                                                <option value="sigmoid">Sigmoid</option>
                                                <option value="relu">ReLU</option>
                                                <option value="tanh">Tanh</option>
                                                <option value="linear">Linear</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-dark-text-secondary mb-1">Weight Initializer</label>
                                        <select
                                            className="w-full px-2 py-1 border rounded-md text-sm bg-dark-secondary border-dark-border text-dark-text-primary"
                                            value={layer.initializer}
                                            onChange={(e) => handleLayerUpdate(index, 'initializer', e.target.value as WeightInitializer)}
                                            disabled={isTraining}
                                        >
                                            <option value="random">Random</option>
                                            <option value="he">He</option>
                                            <option value="xavier">Xavier/Glorot</option>
                                            <option value="xavier_uniform">Xavier Uniform</option>
                                            <option value="zero">Zero</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3 p-3 border rounded-md bg-dark-primary border-dark-border">
                        <div className="text-sm font-medium mb-2 text-dark-text-primary">Output Layer</div>

                        <div className="grid grid-cols-1 gap-2 mb-2">
                            <div>
                                <label className="block text-xs text-dark-text-secondary mb-1">Activation</label>
                                <select
                                    className="w-full px-2 py-1 border rounded-md text-sm bg-dark-secondary border-dark-border text-dark-text-primary"
                                    value={outputLayerConfig.activation}
                                    onChange={(e) => handleOutputLayerUpdate('activation', e.target.value as ActivationFunction)}
                                >
                                    <option value="sigmoid">Sigmoid</option>
                                    <option value="relu">ReLU</option>
                                    <option value="tanh">Tanh</option>
                                    <option value="linear">Linear</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-dark-text-secondary mb-1">Weight Initializer</label>
                                <select
                                    className="w-full px-2 py-1 border rounded-md text-sm bg-dark-secondary border-dark-border text-dark-text-primary"
                                    value={outputLayerConfig.initializer}
                                    onChange={(e) => handleOutputLayerUpdate('initializer', e.target.value as WeightInitializer)}
                                    disabled={isTraining}
                                >
                                    <option value="random">Random</option>
                                    <option value="he">He</option>
                                    <option value="xavier">Xavier/Glorot</option>
                                    <option value="xavier_uniform">Xavier Uniform</option>
                                    <option value="zero">Zero</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm text-dark-text-secondary mb-1">Optimizer</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md bg-dark-secondary border-dark-border text-dark-text-primary"
                            value={networkConfig.optimizer || 'adam'}
                            onChange={(e) => handleOptimizerChange(e.target.value as OptimizerType)}
                            disabled={isTraining}
                        >
                            <option value="sgd">SGD</option>
                            <option value="sgd_momentum">SGD with Momentum</option>
                            <option value="rmsprop">RMSProp</option>
                            <option value="adam">Adam</option>
                            <option value="adagrad">Adagrad</option>
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
                        <label htmlFor="useBias" className="text-sm text-dark-text-secondary">Use Bias</label>
                    </div>
                </div>

                {/* Center/Right Panel - Visualization and Additional Config */}
                <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Visualization Panel - Takes full width */}
                    <div className="bg-dark-secondary p-4 rounded-lg shadow-md shadow-black/5 lg:col-span-12 flex flex-col border border-dark-border">
                        {/* 3D Plot - Full width container with increased height */}
                        <div className="w-full h-80 md:h-96 lg:h-[420px] rounded-lg border border-dark-border overflow-hidden" ref={plot3dRef}>
                            {!plotlyAvailable && (
                                <div className="w-full h-full flex items-center justify-center bg-dark-primary">
                                    <p className="text-dark-text-secondary">Loading visualization...</p>
                                </div>
                            )}
                        </div>

                        {/* Container for Loss and Accuracy Plots side by side with increased height */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Loss Plot - Increased height */}
                            <div className="h-64 lg:h-72 rounded-lg border border-dark-border overflow-hidden" ref={lossPlotRef}>
                                {!plotlyAvailable && (
                                    <div className="w-full h-full flex items-center justify-center bg-dark-primary">
                                        <p className="text-dark-text-secondary">Loading visualization...</p>
                                    </div>
                                )}
                            </div>

                            {/* Accuracy Plot - Increased height */}
                            <div className="h-64 lg:h-72 rounded-lg border border-dark-border overflow-hidden" ref={contourPlotRef}>
                                {!plotlyAvailable && (
                                    <div className="w-full h-full flex items-center justify-center bg-dark-primary">
                                        <p className="text-dark-text-secondary">Loading visualization...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Training Progress */}
                        <div className="mt-4">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-dark-text-secondary">Epoch {currentEpoch} / {trainingConfig.numEpochs}</span>
                                <span className="text-sm text-dark-text-secondary">{progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-dark-primary rounded-full h-2">
                                <div
                                    className="bg-dark-accent h-2 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Training Configuration Panel - Half width */}
                    <div className="bg-dark-secondary p-4 rounded-lg shadow-md shadow-black/5 lg:col-span-6 border border-dark-border">
                        <h4 className="font-medium text-dark-text-primary mb-2">Training Parameters</h4>

                        <div className="mb-3">
                            <label className="block text-sm text-dark-text-secondary mb-1">
                                Learning Rate: {trainingConfig.learningRate}
                            </label>
                            <input
                                type="range"
                                min="0.0001"
                                max="0.1"
                                step="0.0001"
                                className="w-full accent-dark-accent"
                                value={trainingConfig.learningRate}
                                onChange={(e) => updateTrainingConfig('learningRate', parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-dark-text-secondary mb-1">
                                Epochs: {trainingConfig.numEpochs}
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="1000"
                                step="100"
                                className="w-full accent-dark-accent"
                                value={trainingConfig.numEpochs}
                                onChange={(e) => updateTrainingConfig('numEpochs', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-dark-text-secondary mb-1">
                                Batch Size: {trainingConfig.batchSize}
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="128"
                                step="8"
                                className="w-full accent-dark-accent"
                                value={trainingConfig.batchSize}
                                onChange={(e) => updateTrainingConfig('batchSize', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm text-dark-text-secondary mb-1">
                                Noise: {trainingConfig.noise}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="0.5"
                                step="0.01"
                                className="w-full accent-dark-accent"
                                value={trainingConfig.noise}
                                onChange={(e) => updateTrainingConfig('noise', parseFloat(e.target.value))}
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex space-x-2 mt-4">
                            <button
                                className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center text-dark-text-primary 
                                    ${isTraining
                                        ? 'bg-dark-tertiary'
                                        : 'bg-dark-accent hover:bg-dark-accent/80 pulse-animation'
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
                                className="flex-1 px-4 py-2 bg-dark-primary hover:bg-dark-primary/80 rounded-md flex items-center justify-center text-dark-text-primary"
                                onClick={resetPlayground}
                            >
                                <RefreshCw className="mr-1 h-4 w-4" /> Restart
                            </button>
                        </div>
                    </div>

                    {/* Data Configuration Panel - Half width */}
                    <div className="bg-dark-secondary p-4 rounded-lg shadow-md shadow-black/5 lg:col-span-6 border border-dark-border">
                        <h4 className="font-medium text-dark-text-primary mb-2">Data</h4>

                        <div className="mb-3">
                            <label className="block text-sm text-dark-text-secondary mb-1">Function</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md bg-dark-primary border-dark-border text-dark-text-primary"
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
                            <label className="block text-sm text-dark-text-secondary mb-1">
                                Samples: {dataConfig.samples}
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="2000"
                                step="100"
                                className="w-full accent-dark-accent"
                                value={dataConfig.samples}
                                onChange={(e) => updateDataConfig('samples', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="mb-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="useNormalization"
                                    className="mr-2 accent-dark-accent"
                                    checked={dataConfig.useNormalization}
                                    onChange={(e) => {
                                        updateDataConfig('useNormalization', e.target.checked);
                                        if (controllerRef.current) {
                                            controllerRef.current.setUseNormalization(e.target.checked);
                                        }
                                    }}
                                />
                                <label htmlFor="useNormalization" className="text-sm text-dark-text-secondary">
                                    Use Standard Scaler Normalization
                                </label>
                            </div>
                            <p className="text-xs text-dark-text-secondary/70 mt-1">
                                Normalizes input and output data for better training. Visualization will display original (denormalized) values.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NNPlayground; 