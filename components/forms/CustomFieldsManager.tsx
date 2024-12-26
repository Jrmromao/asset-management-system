import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings, Eye } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import CustomInput from '@/components/CustomInput';
import { useFieldArray } from 'react-hook-form';

const FIELD_TYPES = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'select', name: 'Dropdown' }
];

const CustomFieldsManager = ({ form }) => {
    const [showBuilder, setShowBuilder] = useState(false);
    const [newField, setNewField] = useState({
        name: '',
        type: 'text',
        options: []
    });
    const [newOption, setNewOption] = useState('');

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'customFields'
    });

    const handleAddField = () => {
        if (newField.name.trim()) {
            append({
                id: `custom-${Date.now()}`,
                ...newField,
                value: ''
            });
            setNewField({
                name: '',
                type: 'text',
                options: []
            });
        }
    };

    const handleAddOption = () => {
        if (newOption.trim()) {
            setNewField(prev => ({
                ...prev,
                options: [...(prev.options || []), newOption.trim()]
            }));
            setNewOption('');
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-medium">Additional Fields</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBuilder(!showBuilder)}
                >
                    {showBuilder ? <Eye className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                    {showBuilder ? 'Preview' : 'Customize'}
                </Button>
            </CardHeader>
            <CardContent>
                {showBuilder ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fieldName">Field Name</Label>
                                <Input
                                    id="fieldName"
                                    value={newField.name}
                                    onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter field name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fieldType">Field Type</Label>
                                <Select
                                    value={newField.type}
                                    onValueChange={(value) => setNewField(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select field type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map(type => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {newField.type === 'select' && (
                            <div className="space-y-2">
                                <Label>Options</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        placeholder="Enter option"
                                    />
                                    <Button onClick={handleAddOption}>Add Option</Button>
                                </div>
                                {newField.options?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newField.options.map((option, index) => (
                                            <div key={index} className="flex items-center gap-1 bg-secondary/20 px-2 py-1 rounded">
                                                <span>{option}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setNewField(prev => ({
                                                        ...prev,
                                                        options: prev.options.filter((_, i) => i !== index)
                                                    }))}
                                                >
                                                    <Trash2 className="w-3 h-3 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button onClick={handleAddField}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Field
                            </Button>
                        </div>

                        {fields.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Current Custom Fields</h4>
                                <div className="space-y-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                                            <div>
                                                <span className="font-medium">{field.name}</span>
                                                <span className="text-sm text-muted-foreground ml-2">({field.type})</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-2">
                                <CustomInput
                                    name={`customFields.${index}.value`}
                                    label={field.name}
                                    control={form.control}
                                    type={field.type}
                                    options={field.options}
                                />
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <Alert className="col-span-2">
                                No custom fields added yet. Click the Customize button to add fields.
                            </Alert>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CustomFieldsManager;