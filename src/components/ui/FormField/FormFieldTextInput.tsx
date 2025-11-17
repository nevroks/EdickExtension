
import TextInput, { type TextInputPropsType } from '../TextInput';
import { useFormFieldContext } from './FormFieldContext';



type FormFieldTextInputProps = Omit<TextInputPropsType, 'variants'> & {

}

const FormFieldTextInput = ({ ...props }: FormFieldTextInputProps) => {

    const { error } = useFormFieldContext()

    return (
        <TextInput variants={error.length ? 'error' : 'default'} {...props} />
    );
}

export default FormFieldTextInput;
