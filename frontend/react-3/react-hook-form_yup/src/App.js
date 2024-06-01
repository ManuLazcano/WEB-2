import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

function App() {
  const schema = yup.object().shape({
    name: yup.string().required("El nombre es obligatorio"),
    email: yup.string().required("El email es obligatorio").email("Email incorrecto")
  });
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const sendData = (data) => {
    console.log(data);
  }

  return (
    <>
      <form onSubmit={handleSubmit(sendData)}>
        <div>
          <label htmlFor="name">Nombre:</label>
          <input type="text" {...register("name")} />
          {errors.name && <span>{errors.name.message}</span> }
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" {...register("email")} />
          {errors.email && <span>{errors.email.message}</span> }
        </div>
        <button type="submit">Enviar</button>
      </form>
    </>
  );
}

export default App;
