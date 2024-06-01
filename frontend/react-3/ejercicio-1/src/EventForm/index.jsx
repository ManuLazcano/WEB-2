import React, { useContext, useEffect } from "react";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver} from '@hookform/resolvers/yup';
import { EventContext } from "../Contexts/EventContext";
import { formatDate } from "../utils";

function EventForm() {
    const schema = yup.object().shape({
        name: yup.string().required('El nombre es obligatorio'),
        location: yup.string().required('El lugar es obligatorio'),
        date: yup.date().required('La fecha es obligatoria').transform((value, originalValue) => {
            const [day, month, year] = originalValue.split('/');
            return new Date(year, month - 1, day);
          }), // TO-DO: Validar formato de fecha
        organizer: yup.string().required('El organizador es obligatorio'),
        contact: yup.string().email('Email invalido').required('El email es obligatorio')
    });
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
    });

    const { addEvent, valueToEdit, edditEvent } = useContext(EventContext);

    useEffect(() => {
        if (valueToEdit) {
            reset({
                name: valueToEdit.name || '',
                location: valueToEdit.location || '',
                date: formatDate(valueToEdit.date) || '',
                organizer: valueToEdit.organizer || '',
                contact: valueToEdit.contact || ''
            });
        } else {
            reset({
                name: '',
                location: '',
                date: '',
                organizer: '',
                contact: ''
            });
        }
    }, [valueToEdit, reset]);

    const onSubmit = (data) => {        
        if (valueToEdit) {
            edditEvent(data);
        } else {
            addEvent(data);
            reset();
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="name">Nombre: </label>
                    <input {...register("name")} />
                    {errors.name && <span>{errors.name.message}</span>}
                </div>
                <div>
                    <label htmlFor="location">Lugar: </label>
                    <input {...register("location")} />
                    {errors.location && <span>{errors.location.message}</span>}
                </div>
                <div>
                    <label htmlFor="date">Fecha: </label>
                    <input {...register("date")} />
                    {errors.date && <span>{errors.date.message}</span>}
                </div>
                <div>
                    <label htmlFor="organizer">Organizador: </label>
                    <input {...register("organizer")} />
                    {errors.organizer && <span>{errors.organizer.message}</span>}
                </div>
                <div>
                    <label htmlFor="contact">Contacto: </label>
                    <input {...register("contact")} />
                    {errors.contact && <span>{errors.contact.message}</span>}
                </div>                
                <button type="submit">{`${valueToEdit?.name ? 'Editar' : 'Crear'}`}</button>                
            </form>
        </>
    );
}

export { EventForm };
