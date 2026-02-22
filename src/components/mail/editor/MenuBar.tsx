import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";

const menuButtonBase =
  "flex h-8 w-8 items-center justify-center rounded-md text-[#5f6368] transition-colors hover:bg-[#e8eaed] hover:text-[#202124] disabled:opacity-40 disabled:hover:bg-transparent dark:text-[#9aa0a6] dark:hover:bg-[#3c4043] dark:hover:text-[#e8eaed]";
const menuButtonActive =
  "bg-[#e8eaed] text-[#1a73e8] dark:bg-[#3c4043] dark:text-[#8ab4f8]";

const TipTapMenuBar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="flex flex-wrap gap-0.5">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${menuButtonBase} ${editor.isActive("bold") ? menuButtonActive : ""}`}
      >
        <Bold className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${menuButtonBase} ${editor.isActive("italic") ? menuButtonActive : ""}`}
      >
        <Italic className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${menuButtonBase} ${editor.isActive("strike") ? menuButtonActive : ""}`}
      >
        <Strikethrough className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`${menuButtonBase} ${editor.isActive("code") ? menuButtonActive : ""}`}
      >
        <Code className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 1 }) ? menuButtonActive : ""}`}
      >
        <Heading1 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 2 }) ? menuButtonActive : ""}`}
      >
        <Heading2 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 3 }) ? menuButtonActive : ""}`}
      >
        <Heading3 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 4 }) ? menuButtonActive : ""}`}
      >
        <Heading4 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 5 }) ? menuButtonActive : ""}`}
      >
        <Heading5 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`${menuButtonBase} ${editor.isActive("heading", { level: 6 }) ? menuButtonActive : ""}`}
      >
        <Heading6 className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${menuButtonBase} ${editor.isActive("bulletList") ? menuButtonActive : ""}`}
      >
        <List className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${menuButtonBase} ${editor.isActive("orderedList") ? menuButtonActive : ""}`}
      >
        <ListOrdered className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${menuButtonBase} ${editor.isActive("blockquote") ? menuButtonActive : ""}`}
      >
        <Quote className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={menuButtonBase}
      >
        <Undo className="size-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={menuButtonBase}
      >
        <Redo className="size-4" />
      </button>
    </div>
  );
};

export default TipTapMenuBar;
