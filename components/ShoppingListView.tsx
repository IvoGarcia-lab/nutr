import React from 'react';
import { ShoppingList, ShoppingListItem as ShoppingListItemType } from '../types';
import Card from './ui/Card';

interface ShoppingListViewProps {
    shoppingList: ShoppingList;
    onItemToggle: (itemName: string) => void;
}

const ShoppingListItem: React.FC<{ item: ShoppingListItemType, onToggle: (name: string) => void }> = ({ item, onToggle }) => {
    return (
        <label htmlFor={`item-${item.name}`} className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-emerald-50 rounded-lg transition-colors ${item.completed ? 'opacity-60' : ''}`}>
            <input
                id={`item-${item.name}`}
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggle(item.name)}
                className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex-1">
                <span className={`text-gray-800 ${item.completed ? 'line-through' : ''}`}>{item.name}</span>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{item.quantity}</div>
        </label>
    );
};


const ShoppingListView: React.FC<ShoppingListViewProps> = ({ shoppingList, onItemToggle }) => {
    const groupedItems = shoppingList.reduce((acc, item) => {
        const category = item.category || 'Outros';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, ShoppingListItemType[]>);
    
    const categories = Object.keys(groupedItems).sort();
    
    const completedCount = shoppingList.filter(item => item.completed).length;
    const totalItems = shoppingList.length;
    const progressPercentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800">A sua Lista de Compras</h2>
            
            <Card>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Progresso das Compras</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-emerald-600">{completedCount}/{totalItems}</span>
                  </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                    <Card key={category}>
                        <div className="p-4 bg-gray-50 border-b rounded-t-xl">
                            <h3 className="text-lg font-bold text-gray-700">{category}</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {groupedItems[category].map(item => (
                                <ShoppingListItem key={item.name} item={item} onToggle={onItemToggle} />
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ShoppingListView;