/* eslint-disable react-refresh/only-export-components */
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary/90",
                destructive: "bg-red-500 text-white hover:bg-red-600",
                outline: "border border-slate-200 hover:bg-slate-100 hover:text-slate-900",
                secondary: "bg-secondary text-white hover:bg-secondary/90",
                ghost: "hover:bg-slate-100 hover:text-slate-900",
                link: "underline-offset-4 hover:underline text-primary",
            },
            size: {
                default: "h-10 py-2 px-4",
                sm: "h-9 px-3 rounded-md",
                lg: "h-11 px-8 rounded-md",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = ({ className, variant, size, ...props }) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
};

export { Button, buttonVariants };
