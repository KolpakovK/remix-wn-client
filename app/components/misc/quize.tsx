import { cn } from "~/libs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import TextEditor from "./richeditor";

import { useSubmit, useActionData } from "@remix-run/react";

import { ReactNode, useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Terminal } from "lucide-react";

export default function QuizeBlock(){
    const submit = useSubmit();

    const action_data:any = useActionData()

    const downloadLinkRef = useRef<HTMLAnchorElement>(null);

    const [editorStartText,setEditorStartText] = useState("");
    const [rawEditorStartText,setRawEditorStartText] = useState("");

    const [editorEndText,setEditorEndText] = useState("");
    const [rawEditorEndText,setRawEditorEndText] = useState("");

    const [editorFullText,setEditorFullText] = useState("");
    const [rawEditorFullText,setRawEditorFullText] = useState("");

    const [editorErros,setEditorErrors]:any = useState(null)

    const [questions,setQuestions]:any = useState([])

    const [author,setAuthor] = useState("");
    const [title,setTitle] = useState("");

    useEffect( () => {
        let html = "";
        let raw = "";

        questions.forEach( (question:any) => {
            html+= `<p><b>${question.title}</b></p><p>${question.answers.join(' ')}</p>  <br/>`
            raw+= `${question.title} ${question.answers.join(' ')}`
        });

        setRawEditorFullText(rawEditorStartText+raw+rawEditorEndText);
        setEditorFullText(editorStartText+html+editorEndText);
    }, [editorStartText,editorEndText,rawEditorStartText,rawEditorEndText,questions] )

    function downloadFile(){
        submit({type:"download",content:editorFullText},{ method:"POST" });
    }

    function checkText(){
        submit({type:"check",content:editorFullText},{ method:"POST" });
    }

    function addQuestion(){
        let allQuestions:any = questions;

        allQuestions.push({
            title:"",
            answers:[
                ""
            ]
        })

        setQuestions([...allQuestions]);
    }

    function deleteQuestion(index:number){
        let allQuestions:any = questions;

        allQuestions.splice(index, 1);

        setQuestions([...allQuestions]);
    }

    function setQuestionTitle(index:number,value:string){
        let allQuestions:any[] = questions;

        allQuestions[index].title = value;

        setQuestions([...allQuestions]);
    }

    function addAnswer(index:number){
        let allQuestions:any = questions;

        allQuestions[index].answers.push("")

        setQuestions([...allQuestions]);
    }

    function deleteQuestionAnswer(index:number,answerIndex:number){
        let allQuestions:any = questions;

        allQuestions[index].answers.splice(answerIndex, 1);

        setQuestions([...allQuestions]);
    }

    function setQuestionAnswer(index:number,answerIndex:number,value:string){
        let allQuestions:any[] = questions;

        allQuestions[index].answers[answerIndex] = value;

        setQuestions([...allQuestions]);
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
            if (action_data.type=="check"){
                setEditorErrors(action_data.data);
            }
        }
    }, [action_data] )

    return (
        <div className="flex flex-col lg:grid grid-cols-4 gap-4 pt-10">
            <div className="col-span-3 flex flex-col gap-10">

                <div className="flex flex-col gap-2">
                    <p className="text-xl lg:text-3xl text-slate-800 uppercase">Создание опроса</p>
                    <p className="text-sm lg:text-base text-slate-500">В данном редакторе Вы можете создать текстовый опрос и после скачать работу в формате DOCX. Помимо этого Вы также можете получить оценку текста от искусственного интелекта.</p>
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

                    <div className="flex flex-1 flex-col gap-2">
                        <Label>Начало работы</Label>
                        <TextEditor onEditorChange={setEditorStartText} onErrorsGet={() => {}} onEditorRawChange={setRawEditorStartText} checkSpell={false}/>
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                        <Label>Вопросы</Label>
                        <div className="flex flex-col gap-4">
                            {questions.map( (question:any,index:number) => (
                                <div key={index} className="flex flex-col lg:flex-row gap-4">
                                    <div className="lg:flex-1 flex gap-2">
                                        <Input type="text" placeholder="Ваш вопрос" onChange={ (e:any) => setQuestionTitle(index,e.target.value) }/>
                                        <Button variant={"destructive"} className=" rounded-md" onClick={ () => deleteQuestion(index) }>Удалить</Button>
                                    </div>
                                    <div className="flex flex-col gap-4 lg:flex-1 w-full">

                                        {question.answers.map( (answer:any,answerIndex:number) => (
                                            <div key={answerIndex} className="flex gap-2">
                                                <Input type="text" placeholder="Ваш ответ" onChange={ (e:any) => setQuestionAnswer(index,answerIndex,e.target.value) }/>
                                                <Button variant={"destructive"} className=" rounded-md" onClick={ () => deleteQuestionAnswer(index,answerIndex) }>Удалить</Button>
                                            </div>
                                        ))}

                                        <Button variant={"ghost"} onClick={ () => addAnswer(index) }>Добавить ответ</Button>
                                    </div>
                                </div>
                            ) )}
                        </div>
                        <Button variant={"outline"} onClick={ () => addQuestion() }>Добавить вопрос</Button>
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                        <Label>Финал работы</Label>
                        <TextEditor onEditorChange={setEditorEndText} onErrorsGet={() => {}} onEditorRawChange={setRawEditorEndText} checkSpell={false}/>
                    </div>

                    <Button variant={"outline"} onClick={ () => checkText() }>Проверить работу</Button>
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
                        <p className={cn("text-lg", rawEditorFullText.replace(/\s+/g, '').length>1000 ? (rawEditorFullText.replace(/\s+/g, '').length>4000 ? "text-yellow-500" : "text-green-400") : "text-red-500")}>{rawEditorFullText.replace(/\s+/g, '').length}</p>
                        {rawEditorFullText.replace(/\s+/g, '').length<1000 && (
                            <p className=" text-xs text-slate-500">Длина текстовой работы не должна быть меньше чем 1000 символов</p>
                        )}
                        {rawEditorFullText.replace(/\s+/g, '').length>4000 && (
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