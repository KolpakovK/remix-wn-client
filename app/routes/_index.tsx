import type { MetaFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import textgears from 'textgears-api';

import { useState } from "react";
import { cn } from "~/libs";

import { Info } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import WatermarkBlock from "~/components/misc/watermark";
import ArticleBlock from "~/components/misc/article";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "~/components/ui/alert-dialog"
import QuizeBlock from "~/components/misc/quize";


export const meta: MetaFunction = () => {
    return [
        { title: "WN Editor" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export async function action({ request }:ActionFunctionArgs) {
    const body = await request.formData();
    
    let result:any={};
    if (body.get("type")=="check"){
        result.type="check";
        result.data=[]

        const maxChunkSize = 400;
        let chunks = [];
        let text:any = body.get("content");
        let start = 0;

        while (start < text.length) {
            // Определяем максимальную длину фрагмента
            let end:any = start + maxChunkSize;
    
            // Если конец фрагмента превышает длину текста, то берем до конца текста
            if (end >= text.length) {
                chunks.push(text.slice(start));
                break;
            }
    
            // Определяем позицию последнего пробела перед пределом 400 символов
            let lastSpace = text.lastIndexOf(' ', end);
            if (lastSpace > start) {
                // Если пробел найден, то делим по этому пробелу
                chunks.push(text.slice(start, lastSpace));
                start = lastSpace + 1; // Начинаем с символа после пробела
            } else {
                // Если пробел не найден, вынужденно делим на 400 символов
                chunks.push(text.slice(start, end));
                start = end;
            }
        }

        // Функция для отправки запроса к API Яндекс Спеллера
        async function checkChunk(chunk:any) {
            const response = await fetch(`https://speller.yandex.net/services/spellservice.json/checkText?text=${encodeURIComponent(chunk)}`);
            return response.json();
        }

        // Запросы для всех частей текста
        const requests = chunks.map(chunk => checkChunk(chunk));

        // Выполняем все запросы и ждем их завершения
        const results = await Promise.all(requests);

        console.log(results)
        // Объединяем результаты всех запросов в один массив
        result.data = results.flat();
    }

    if (body.get("type")=="download"){
        result.type="download";
        result.data={};

        let text:any = body.get("content");

        await fetch(`${process.env.SERVER_HOST}convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ html: text }),
        }).then( data => data.json() )
        .then( data => {
            result.data = data.data.data;
        } )
    }

    return result;
}

export default function Index() {
    const [showIntro,setShowIntro] = useState(true);
    const [selectedWork,setSelectedWork] = useState("watermark")

    const [showInfo,setShowInfo] = useState(false);

    let _server_data = useActionData();

    return (
        <div className="flex flex-col justify-between bg-slate-50 min-h-screen">
            
            <div className="fixed z-50 w-full top-2">
                <div className="container bg-white p-2 rounded-full w-full flex justify-between items-center shadow-sm border border-slate-300">
                    <div className="flex items-center gap-4 pl-2">
                        <img src="wn-black-logo.svg" alt="Logo" className="h-6 w-fit" />
                        <p className="text-sm font-light text-slate-700 tracking-wide">TEXT HELPER</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!showIntro && (
                            <Button variant={"outline"} onClick={ () => setShowIntro(true) }>Показать приветствие</Button>
                        )}
                        
                        <AlertDialog open={showInfo} onOpenChange={ (open) => setShowInfo(open) }>
                            <AlertDialogTrigger asChild><Button variant={"secondary"} size={"sm"}><Info className="mr-2" size={20}/> Инфо</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Инфо</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <div className="flex flex-col">
                                            <p className="text-base">Сервис специально разработан для эффективной поддержки работы отдела журналистики Weazel News. Он позволяет журналистам выбирать тип работы, заполнять все необходимые поля и получать качественный результат. В текущей версии вы можете добавить водяной знак на изображение, создать статью, интервью или опрос, а также проверить текст на грамматические ошибки. После завершения всех этапов обработки, готовый файл будет доступен для скачивания. Этот инструмент упрощает рабочий процесс и помогает оперативно создавать профессиональные материалы.</p>
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction>Понял</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>


                    </div>
                </div>
            </div>

            <div className="container flex flex-col gap-6 py-4">

                {showIntro && (
                <div className="flex flex-col gap-6 pt-16">
                    <img src="wn.png" alt="Person" className=" rounded-2xl max-h-[550px] object-cover w-full"/>

                    <div className="flex flex-col gap-6 lg:grid grid-cols-4">
                        <div className="flex flex-col gap-2 col-span-2">
                            <p className="text-sm text-slate-600 uppercase tracking-wide font-light">Хелпер отдела журналистики</p>
                            <p className="text-2xl lg:text-6xl text-slate-900 uppercase font-light">Ваш помощник для оперативной и эффективной работы!</p>
                        </div>

                        <div className="col-start-4 flex flex-col justify-end gap-8">
                            <p className="text-slate-600">Сервис для быстрого создания и проверки текстов, идеально подходящий для отдела журналистики. Помогает оперативно готовить статьи и проверять их качество, упрощая рабочий процесс.</p>
                        
                            <div className="flex items-center gap-2">
                                <Button onClick={ () => setShowInfo(true) }>Приступить</Button>
                                <Button variant={"outline"} onClick={ () => setShowIntro(false) }>Спрятать приветствие</Button>
                            </div>
                        </div>
                    </div>
                </div>
                )}
                
                <div className="flex gap-4 flex-col lg:flex-row justify-between mt-16 pt-6 border-t border-slate-300">
                    <p className="text-lg text-slate-900">Выберите тип работы</p>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Button onClick={ () => setSelectedWork("watermark") } variant={selectedWork=="watermark" ? "default" : "secondary"} size={"sm"}>Вотермарка</Button>
                        <Button onClick={ () => setSelectedWork("article") } variant={selectedWork=="article" ? "default" : "secondary"} size={"sm"}>Статья</Button>
                        <Button onClick={ () => setSelectedWork("quize") } variant={selectedWork=="quize" ? "default" : "secondary"} size={"sm"}>Опрос</Button>
                        <Button onClick={ () => setSelectedWork("interview") } variant={selectedWork=="interview" ? "default" : "secondary"} size={"sm"}>Интервью</Button>
                    </div>
                </div>

                {selectedWork=="watermark" && (
                    <WatermarkBlock/>
                )}

                {selectedWork=="article" && (
                    <ArticleBlock/>
                )}

                {selectedWork=="quize" && (
                    <QuizeBlock/>
                )}
            </div>
        </div>
    );
}
