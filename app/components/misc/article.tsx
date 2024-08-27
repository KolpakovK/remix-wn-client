import { cn } from "~/libs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import TextEditor from "./richeditor";

import { useSubmit, useActionData } from "@remix-run/react";

import { ReactNode, useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Terminal } from "lucide-react";

export default function ArticleBlock(){
    const submit = useSubmit();

    const action_data:any = useActionData()

    const downloadLinkRef = useRef<HTMLAnchorElement>(null);

    const [editorText,setEditorText] = useState("");
    const [rawEditorText,setRawEditorText] = useState("");
    const [editorErros,setEditorErrors]:any = useState(null)

    const [author,setAuthor] = useState("");
    const [title,setTitle] = useState("");


    function downloadFile(){
        submit({type:"download",content:editorText},{ method:"POST" });
    }

    useEffect( () => {
        if (action_data){
            if (action_data.type=="download"){
                if (downloadLinkRef.current) {
                    const blob:any = new Blob([new Uint8Array(action_data.data)], { type: 'application/octet-stream' });
                    const url:any = URL.createObjectURL(blob);

                    downloadLinkRef.current.href = url;
                    downloadLinkRef.current.download = `${title} - ${author}.docx`;
                    downloadLinkRef.current.click();

                    URL.revokeObjectURL(url);
                }
            }
        }
    }, [action_data] )

    return (
        <div className="flex flex-col lg:grid grid-cols-4 gap-4 pt-10">
            <div className="col-span-3 flex flex-col gap-10">

                <div className="flex flex-col gap-2">
                    <p className="text-xl lg:text-3xl text-slate-800 uppercase">Создание статьи</p>
                    <p className="text-sm lg:text-base text-slate-500">В данном редакторе Вы можете создать текстовую статью и после скачать её в формате DOCX. Помимо этого Вы также можете получить оценку текста от искусственного интелекта.</p>
                </div>

                <div className="flex flex-col gap-4 lg:gap-6">
                    <div className="flex gap-4 lg:gap-6">
                        {/* Author */}
                        <div className="flex flex-1 flex-col gap-2">
                            <Label>Автор</Label>
                            <Input type="text" name="author" onChange={ (e:any) => setAuthor(e.target.value) }/>
                        </div>

                        {/* Title */}
                        <div className="flex flex-1 flex-col gap-2">
                            <Label>Название работы</Label>
                            <Input type="text" name="name" onChange={ (e:any) => setTitle(e.target.value) }/>
                        </div>
                    </div>

                    <TextEditor onEditorChange={setEditorText} onErrorsGet={setEditorErrors} onEditorRawChange={setRawEditorText}/>

                    <Button onClick={ () => downloadFile() }>Скачать работу</Button>

                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Наберитесь терпения!</AlertTitle>
                        <AlertDescription>
                            Так как сервера бесплатны, то время ожидания проверки и загрузки сообщений могут занять до 1 минуты.
                        </AlertDescription>
                    </Alert>

                    <a href="#" ref={downloadLinkRef} className="hidden">#</a>

                </div>
                
            </div>

            <div className="flex flex-col gap-4">

                <div className="flex flex-col gap-3">
                    <p className="text-xl">Памятка</p>
                    <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-700">Длина текста</p>
                        <p className={cn("text-lg", rawEditorText.replace(/\s+/g, '').length>1000 ? (rawEditorText.replace(/\s+/g, '').length>4000 ? "text-yellow-500" : "text-green-400") : "text-red-500")}>{rawEditorText.replace(/\s+/g, '').length}</p>
                        {rawEditorText.replace(/\s+/g, '').length<1000 && (
                            <p className=" text-xs text-slate-500">Длина текстовой работы не должна быть меньше чем 1000 символов</p>
                        )}
                        {rawEditorText.replace(/\s+/g, '').length>4000 && (
                            <p className=" text-xs text-slate-500">Длина текстовой работы желательно не должна превышать 4000 символов</p>
                        )}
                    </div>
                </div>

                {editorErros!=null && (
                    <div className='flex flex-col p-6 bg-white border border-slate-300 rounded-xl h-fit'>
                        <p className="text-lg font-medium text-slate-900">Результаты проверки</p>
                        {editorErros.length ? (
                            <div>
                                {editorErros.map( (edit:any,index:number) => (
                                    <p key={index} className='text-sm font-light' dangerouslySetInnerHTML={{ __html: `<b style="color:red !important;">${edit.word}</b> - ${edit.s[0]}` }}></p>
                                ) )}
                            </div>
                        ) : (
                            <p className=" text-green-500 text-base font-medium">Ошибок не найдено!</p>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}