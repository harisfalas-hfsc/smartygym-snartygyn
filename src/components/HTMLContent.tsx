interface HTMLContentProps {
  content: string;
  className?: string;
}

export const HTMLContent = ({ content, className = "" }: HTMLContentProps) => {
  return (
    <div 
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
