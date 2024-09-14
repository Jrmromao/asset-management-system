import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Input} from "@/components/ui/input";
import {FormControl, FormLabel, FormMessage} from "@/components/ui/form";
import {ACCEPTED_FILE_FORMAT, MAX_FILE_SIZE, MAX_FILES} from "@/constants";

interface IProps {
    label?: string
    docType?: string
    acceptFormat?: string[]
    description?: string
}

const Dropzone: React.FC<IProps> = ({label, acceptFormat = ACCEPTED_FILE_FORMAT, description = 'Supported Formats: CSV'}) => {
    const [file, setFile] = useState<File>();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0)
            setFile(acceptedFiles[0]);
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop, maxFiles: MAX_FILES,
        accept: {'application/pdf': acceptFormat},
        maxSize: MAX_FILE_SIZE
    });

    return (<>
            <FormLabel className="form-label">{label}</FormLabel>
            <div  {...getRootProps({})}
                  className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <FormControl>
                    <Input {...getInputProps({})} className="hidden"/>
                </FormControl>

                {file ? (
                    <p className="text-gray-700">{file.name}</p>
                ) : (
                    <p className="mt-4 text-lg text-gray-600">Click to upload or drag and drop</p>
                )}
                <p className="mt-2 text-sm text-gray-500">{description}</p>
                <p className="text-sm text-gray-500">Max size: 25MB</p>
                {/*<input type="file" className="hidden"/> */}
            </div>
        </>
    )
};

export default Dropzone;
