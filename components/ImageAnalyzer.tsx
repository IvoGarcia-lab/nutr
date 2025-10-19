import React, { useState, useRef, useEffect } from 'react';
import { MealAnalysis } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Loader from './ui/Loader';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Carousel from './ui/Carousel';

interface ImageAnalyzerProps {
    onAnalyze: (images: File[]) => void;
    analyses: MealAnalysis[] | null;
    isLoading: boolean;
}

const AnalysisCard: React.FC<{ analysis: MealAnalysis }> = ({ analysis }) => {
    const macroData = analysis ? [
        { name: 'Proteína', value: analysis.macros.protein },
        { name: 'Hidratos', value: analysis.macros.carbs },
        { name: 'Gordura', value: analysis.macros.fat },
    ] : [];
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

    return (
        <Card>
            <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{analysis.mealName}</h3>
                <p className="text-gray-600 mb-6 h-20 overflow-auto">{analysis.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Estimativa Nutricional</h4>
                        <div className="text-4xl font-extrabold text-emerald-600">
                            {analysis.calories.toFixed(0)} <span className="text-2xl font-medium text-gray-500">kcal</span>
                        </div>
                    </div>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                            {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(1)}g`}/>
                            <Legend />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onAnalyze, analyses, isLoading }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setSelectedFiles(files);
            
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            const newUrls = files.map((file: File) => URL.createObjectURL(file));
            setPreviewUrls(newUrls);
        }
    };

    const handleAnalyzeClick = () => {
        if (selectedFiles.length > 0) {
            onAnalyze(selectedFiles);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-8">
            <Card>
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Analisador de Refeições</h2>
                    <p className="text-gray-500 mb-6">Envie uma ou mais fotos das suas refeições e a nossa IA fará uma estimativa nutricional.</p>
                    
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        multiple
                    />

                    <div 
                        onClick={triggerFileSelect}
                        className="w-full min-h-64 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer hover:border-emerald-400 hover:text-emerald-500 transition-colors"
                    >
                        {previewUrls.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {previewUrls.map((url, index) => (
                                    <img key={index} src={url} alt={`Pré-visualização ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p>Clique para selecionar uma ou mais imagens</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleAnalyzeClick} disabled={selectedFiles.length === 0 || isLoading} className="w-full">
                            {isLoading ? <Loader /> : `Analisar ${selectedFiles.length} Refeição(s)`}
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoading && (
                 <Card>
                    <div className="p-8 flex flex-col items-center justify-center h-full min-h-[300px]">
                        <Loader className="animate-spin h-10 w-10 text-emerald-500" />
                        <p className="mt-4 text-gray-600">A analisar as suas refeições... um momento.</p>
                    </div>
                </Card>
            )}

            {analyses && analyses.length > 0 && (
                <div className="animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Resultados da Análise</h2>
                     <Carousel items={analyses} renderItem={(analysis) => <AnalysisCard analysis={analysis} />} />
                </div>
            )}
        </div>
    );
};

export default ImageAnalyzer;