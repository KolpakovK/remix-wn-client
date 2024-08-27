'use client'

import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Heading from '@tiptap/extension-heading'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { useEditor, EditorContent } from '@tiptap/react'

import { useSubmit } from '@remix-run/react'
import { useActionData } from '@remix-run/react'
import { useState, useEffect, ReactEventHandler, ReactPortal } from 'react'

import { Button } from '../ui/button'

import { Heading1, Heading2, Heading3, Bold as BoldIcon, Italic as ItalicIcon, ListIcon } from 'lucide-react'

export default function TextEditor({onEditorChange,onErrorsGet,onEditorRawChange,checkSpell=true}:Readonly<{onEditorChange:Function,onErrorsGet:Function,onEditorRawChange:Function,checkSpell?:boolean}>) {
    const submit = useSubmit();
    const action_data:any = useActionData()

    const [value,setValue] = useState("");
    const [edits,setEdits]:any = useState(null);

    useEffect( () => {
        console.log(action_data)
        if (action_data){
            if (action_data.type=="check"){
                setEdits(action_data.data);
                onErrorsGet(action_data.data);
            }
        }
    }, [action_data] )

    function TestApi() {
        submit({type:"check",content:value},{ method:"POST" });
    }

    const editor = useEditor({
        extensions: [Document, Paragraph, Text, Bold, Italic, BulletList, ListItem, Heading.configure({ levels: [1, 2, 3], }),],
        content: ``,
        onUpdate: ({editor}:any) => { onEditorChange(editor.getHTML()); setValue(editor.getText()); onEditorRawChange(editor.getText())}
    })

    if (!editor) {
        return null
    }

    return (
        <div className='flex flex-col gap-2'>
            <div className="flex items-center bg-white border border-slate-300 p-2 rounded-md overflow-x-auto">
                <div className="flex items-center gap-2">
                    <Button className='rounded-md' variant={editor.isActive('heading', { level: 1 }) ? "default" : "outline"} size={"icon"} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <Heading1 />
                    </Button>

                    <Button className='rounded-md' variant={editor.isActive('heading', { level: 2 }) ? "default" : "outline"} size={"icon"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 />
                    </Button>

                    <Button className='rounded-md' variant={editor.isActive('heading', { level: 3 }) ? "default" : "outline"} size={"icon"} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <Heading3 />
                    </Button>

                    <Button className='rounded-md' variant={editor.isActive('bold') ? "default" : "outline"} size={"icon"} onClick={() => editor.chain().focus().toggleBold().run()}>
                        <BoldIcon />
                    </Button>

                    <Button className='rounded-md' variant={editor.isActive('italic') ? "default" : "outline"} size={"icon"} onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <ItalicIcon />
                    </Button>

                    <Button className='rounded-md' variant={editor.isActive('bulletList') ? "default" : "outline"} size={"icon"} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <ListIcon />
                    </Button>

                    {checkSpell && (
                        <Button variant={"outline"} onClick={ () => TestApi() }>Проверить текст</Button>
                    )}

                </div>
            </div>
            <EditorContent editor={editor} className='bg-white border border-slate-300 p-2 rounded-md min-h-[450px] rich-editor' />
        </div>
    )
}