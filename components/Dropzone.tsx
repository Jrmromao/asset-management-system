import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Input} from "@/components/ui/input";
import {FormControl, FormLabel, FormMessage} from "@/components/ui/form";

interface IProps {
    label?: string
}

const Dropzone: React.FC<IProps> = ({label}) => {
    const [file, setFile] = useState<File>();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0)
            setFile(acceptedFiles[0]);
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, maxFiles: 1, accept: { 'application/pdf': ['.pdf']}});

    return (<>
            <div className="">
                <div className={'flex w-full flex-col'}>
                    <div {...getRootProps()}  className="flex items-center border border-gray-300 rounded-md p-2 cursor-pointer">
                        <FormControl>
                            <Input
                                {...getInputProps()} className="hidden"
                            />
                        </FormControl>
                        <FormMessage className={'form-message mt-2'}/>
                        <label className="bg-gray-100 py-2 px-4 rounded-r-md cursor-pointer">
                            Browse
                        </label>
                        <label className="flex-grow text-gray-700 py-2 px-4 rounded-l-md cursor-pointer">
                            {file ? file.name : `Choose a ${label}`}
                        </label>
                    </div>
                </div>
            </div>
        </>
    )
        ;
};

export default Dropzone;
