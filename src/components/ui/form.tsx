import { createContext, ReactNode, useContext } from 'react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  FormProvider,
  UseFormReturn,
  useFormContext
} from 'react-hook-form';
import { cn } from '@lib/utils/cn';

interface FormProps<TFieldValues extends FieldValues> {
  children: ReactNode;
  className?: string;
  onSubmit: (values: TFieldValues) => void;
  methods: UseFormReturn<TFieldValues>;
}

export function Form<TFieldValues extends FieldValues>({ children, className, onSubmit, methods }: FormProps<TFieldValues>) {
  return (
    <FormProvider {...methods}>
      <form className={className} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
}

interface FieldContextValue {
  name: string;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  render
}: {
  name: TName;
  render: ({ field }: { field: ControllerRenderProps<TFieldValues, TName> }) => ReactNode;
}) {
  const methods = useFormContext<TFieldValues>();
  return (
    <FieldContext.Provider value={{ name }}>
      <Controller
        control={methods.control}
        name={name}
        render={({ field }) => <>{render({ field: field as any })}</>}
      />
    </FieldContext.Provider>
  );
}

export function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.ComponentProps<'label'>) {
  const field = useFormField();
  return <label className={cn('text-sm font-medium', className)} htmlFor={field.id} {...props} />;
}

export function FormControl({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col', className)} {...props} />;
}

export function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-xs text-slate-500', className)} {...props} />;
}

export function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error } = useFormField();
  if (!error) {
    return null;
  }
  return (
    <p className={cn('text-xs font-medium text-rose-600 dark:text-rose-400', className)} {...props}>
      {String(error.message ?? 'Invalid value')}
    </p>
  );
}

function useFormField() {
  const fieldContext = useContext(FieldContext);
  const methods = useFormContext();
  const fieldState = fieldContext ? methods.getFieldState(fieldContext.name) : undefined;
  const id = fieldContext?.name.replace(/\./g, '-');

  return {
    id,
    error: fieldState?.error
  };
}
