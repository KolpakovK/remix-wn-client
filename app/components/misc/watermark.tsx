import React, { useRef, useState } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "~/libs";

export default function WatermarkBlock() {
    const [imageSrc, setImageSrc] = useState(null);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [downloadUrl, setDownloadUrl]:any = useState(null);
    const logo = "wn-white-logo.svg";
    const canvasRef = useRef(null);

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event: any) => {
            setImageSrc(event.target.result);
        };

        reader.readAsDataURL(file);
    };

    const drawWatermark = () => {
        const canvas:any = canvasRef.current;
        const ctx:any = canvas.getContext("2d");
        const img:any = new Image();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        img.src = imageSrc;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            const textSize = img.height / 22;
            const spacingSize = img.height / 20;

            ctx.drawImage(img, 0, 0);

            // Создание градиента
            const gradientHeight = canvas.height / 2; // Высота градиента
            const gradient = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
            gradient.addColorStop(0, "rgba(0, 0, 0, 0)"); // Прозрачный цвет
            gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)"); // Черный цвет с непрозрачностью 70%

            // Рисование градиента
            ctx.fillStyle = gradient;
            ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);
            
            // Настройка стиля текста
            ctx.font = `${textSize}px Arial`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.textAlign = "right";

            // Рисуем текст
            ctx.fillText(author, canvas.width - spacingSize, canvas.height - spacingSize);

            // Настройка стиля текста
            ctx.font = `bold ${textSize*2}px Arial`;
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.textAlign = "left";

            // Максимальная ширина строки
            const maxWidth:any = canvas.width / 2;
            const lineHeight:any = textSize*2*1.1;
            let x:any = spacingSize;
            let y:any = canvas.height - spacingSize;

            // Функция для разбивки текста на строки
            const wrapText = (context:any, text:any, x:any, y:any, maxWidth:any, lineHeight:any) => {
                const words = text.split(" ");
                let line = "";
                let lines = [];

                for (let n = 0; n < words.length; n++) {
                    let testLine = line + words[n] + " ";
                    let metrics = context.measureText(testLine);
                    let testWidth = metrics.width;

                    if (testWidth > maxWidth && n > 0) {
                        lines.push(line)
                        line = words[n] + " ";
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line)

                for (let n = lines.length-1; n>=0; n--){
                    context.fillText(lines[n], x, y);
                    y -= lineHeight;
                }
            };

            // Рисуем текст с переносом строк
            wrapText(ctx, title.toUpperCase(), x, y, maxWidth, lineHeight);

            if (logo) {
                const logoImg = new Image();
                logoImg.src = logo;
                logoImg.onload = () => {
                    // Рисуем логотип в правом нижнем углу
                    const logoWidth = img.width / 10;
                    const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
                    ctx.drawImage(
                        logoImg,
                        canvas.width - logoWidth - spacingSize,
                        canvas.height - logoHeight - spacingSize - textSize - spacingSize/2,
                        logoWidth,
                        logoHeight
                    );

                    const dataUrl = canvas.toDataURL("image/png");
                    setDownloadUrl(dataUrl);
                };
            }
        };
    };

    return (
        <div className="flex flex-col lg:grid grid-cols-4 gap-4 pt-10">

            <div className="col-span-3 flex flex-col gap-6 lg:gap-10">

                <div className="flex flex-col gap-2">
                    <p className="text-xl lg:text-3xl text-slate-800 uppercase">Добавление вотермарки</p>
                    <p className="text-sm lg:text-base text-slate-500">Вы должны загрузить изображение, ввести имя своего героя и название работы, после чего сервис автоматически накладет логотип компании и указанный текст на изображение. После предварительного просмотра вы можете нажать кнопку «Скачать» для загрузки готовой работы.</p>
                </div>

                <div className="flex flex-col gap-4 lg:gap-6">
                    <div className="flex gap-4 lg:gap-6">
                        {/* Author */}
                        <div className="flex flex-1 flex-col gap-2">
                            <Label>Автор</Label>
                            <Input type="text" name="author" onChange={(e) => setAuthor(e.target.value)}/>
                        </div>

                        {/* Title */}
                        <div className="flex flex-1 flex-col gap-2">
                            <Label>Название работы</Label>
                            <Input type="text" name="name" onChange={(e) => setTitle(e.target.value)}/>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-1 flex-col gap-2">
                        <Label>Картинка</Label>
                        <Input accept="image/*" type="file" name="image" onChange={handleImageUpload} />
                    </div>
                </div>

                <Button onClick={drawWatermark} variant={"outline"}>Добавить водяной знак</Button>

                <div className="flex justify-center items-center h-[450px] bg-white border border-slate-300 p-10 rounded-2xl">
                    <canvas ref={canvasRef} className="w-full h-full object-contain"></canvas>
                </div>

                <Button className={cn(!downloadUrl && "opacity-50 pointer-events-none")} asChild><a href={downloadUrl} download="watermarked-image.png">Скачать фото</a></Button>

            </div>

        </div>
    )
}