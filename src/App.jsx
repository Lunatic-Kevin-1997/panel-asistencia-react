import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
function App(){

  const API_URL = 'https://api-asistencia-backend.onrender.com/api'
  const [empleados, setEmpleados] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPuesto, setNuevoPuesto] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/empleados`)
      .then(respuesta => respuesta.json())
      .then(datos => {
        console.log("Datos recibidos del backend:", datos);
        setEmpleados(datos);
      })
      .catch(error => console.error("Hubo un error en la conexion.", error));
  }, []);
  
  const marcarAsistencia = (id, nuevoEstado) => {
    fetch(`${API_URL}/empleados/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({estado: nuevoEstado})
    })
    .then(respuesta => respuesta.json())
    .then(empleadoActualizado => {
      console.log("Cambio guardado en MySQL", empleadoActualizado);

      const empleadosActualizados = empleados.map((empleado) => {
        if(empleado.id === id){
          return {...empleado, estado: nuevoEstado};
        }
        return empleado;
      })
      setEmpleados(empleadosActualizados);
    })
    .catch(error => {
      console.error("Hubo un error actualizando el estado:", error);
    });
  }

  const obtenerColorBadge = (estado) => {
    if(estado === 'Presente') return 'bg-success';
    if(estado === 'Tarde') return 'bg-warning text-dark';
    if(estado === 'Falta') return 'bg-danger';
    return 'bg-secondary';
  }

  const agregarEmpleado = (e) => {
    e.preventDefault();

    if(nuevoNombre.trim() === '' || nuevoPuesto.trim() === ''){
      Swal.fire('Cuidado!', 'Por favor llena todos los campos antes de guardar','warning');
      return;
    }

    if(nuevoNombre.trim().length<3){
      Swal.fire('Nombre muy corto', 'El nombre del empleado debe tener al menos 3 letras','warning')
      return;
    }
    
    if(nuevoPuesto.trim().length<1){
      Swal.fire('Puesto muy corto', 'El puesto de trabajo no es válido.','warning');
      return;
    }

    const datosParaLaravel = {
      nombre: nuevoNombre,
      departamento: nuevoPuesto,
      estado: 'Pendiente'
    };
    fetch(`${API_URL}/empleados`,{
      method: 'POST',
      headers: {
        'Content-Type': 'aplication/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(datosParaLaravel)
    })
    .then(async (respuesta) => {
      if(!respuesta.ok){
        const errorData = await respuesta.json();
        throw new Error(errorData.message || "Datos inválidos rechazados");
      }
      return respuesta.json();
    })
    .then(empleadoGuardado => {
      console.log("Guardado exitoso en MYSQL", empleadoGuardado);

      setEmpleados([...empleados, empleadoGuardado]);
      setNuevoNombre('');
      setNuevoPuesto('');

      Swal.fire('Éxito!', 'Empleado registrado correctamente', 'success');
    })
    .catch(error => {
      console.error("Hubo un problema guardando al empleado:", error.message);
      Swal.fire('Error de Validación', 'El nombre debe tener al menos 3 letras  ser válido', 'error');
    });
  }

  const eliminarEmpleado = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, despedir',
      cancelButtonText: 'Cancelar'
    }).then((result)=> {
      if(result.isConfirmed){
        fetch(`${API_URL}/empleados/${id}`,{
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(respuesta => respuesta.json())
        .then(datos => {
          const listaActualizada = empleados.filter((empleado) => empleado.id !== id);
          setEmpleados(listaActualizada);

          Swal.fire(
            'Eliminado!',
            'El empleado ha sido borrado de la base de datos.',
            'success'
          );
        })
        .catch(error => {
          console.error("Hubo un error al eliminiar: ", error);
          Swal.fire('Error', 'No se pudo conectar con el servidor', 'error')
        })
      }
    })
  }

  const totalEmpleados = empleados.length;
  const totalPresentes = empleados.filter(emp => emp.estado === 'Presente').length;
  const totalTardes = empleados.filter(emp => emp.estado === 'Tarde').length;
  const totalFaltas = empleados.filter(emp => emp.estado === 'Falta').length;
  
  const empleadosFiltrados = empleados.filter((empleado) => {
    const nombre = empleado.nombre ? empleado.nombre.toLowerCase() : '';
    const departamento = empleado.departamento ? empleado.departamento.toLowerCase() : '';
    const textoBusqueda = busqueda.toLowerCase();

    return nombre.includes(textoBusqueda) || departamento.includes(textoBusqueda);
  })

  return(
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-4">Panel de Asistencia</h1>

      <div className="row mb-4 text-center">
        <div className="col-6 col-md-3 mb-3">
          <div className="card text-white bg-primary shadow h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Total Empleados</h5>
              <h2 className="display-5 fw-bold mb-0">{totalEmpleados}</h2>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <div className="card text-white bg-success shadow h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Presentes</h5>
              <h2 className="display-5 fw-bold mb-0">{totalPresentes}</h2>
            </div>
          </div>
        </div>
    
        <div className="col-6 col-md-3 mb-3">
          <div className="card bg-warning text-dark shadow h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Tardanzas</h5>
              <h2 className="display-5 fw-bold mb-0">{totalTardes}</h2>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <div className="card text-white bg-danger shadow h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title">Faltas</h5>
              <h2 className="display-5 fw-bold mb-0">{totalFaltas}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow mb-4 border-0 bg-light">
        <div className="card-body">
          <h5 className="card-title mb-3 text-secondary">Registrar Nuevo Empleado</h5>
          <form onSubmit={agregarEmpleado} className="row g-3">
            <div className="col-12 col-md-5">
              <input 
                type="text"
                className="form-control"
                placeholder="Nombre completo..."
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-5">
              <input 
                type="text"
                className="form-control"
                placeholder="Puesto de trabajo...."
                value={nuevoPuesto}
                onChange={(e) => setNuevoPuesto(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2">
              <button type="submit" className="btn btn-primary w-100 fw-bold">
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="mb-3">
        <input 
          type="text"
          className="form-control border-primary shadow-sm"
          placeholder="Buscar empleado por nombre o departamento"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="table-responsive shadow rounded">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th>N°</th>
              <th>Empleado</th>
              <th>Puesto</th>
              <th>Estado Actual</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map((empleado, index) => (
              <tr key={empleado.id}>
                <td className="fw-bold text-secondary">{index + 1}</td>
                <td className="fw-bold">{empleado.nombre}</td>
                <td>{empleado.departamento}</td>
                <td>
                  <span className={`badge ${obtenerColorBadge(empleado.estado)} fs-6`}>
                    {empleado.estado}
                  </span>
                </td>
                <td className="text-center">
                  <button 
                    className="btn btn-success btn-sm me-1"
                    onClick={() => marcarAsistencia(empleado.id, 'Presente')}
                  >Presente</button>
                  <button 
                    className="btn btn-warning btn-sm me-1"
                    onClick={()=> marcarAsistencia(empleado.id, 'Tarde')}
                  >Tarde</button>
                  <button 
                    className="btn btn-danger btn-sm me-3"
                    onClick={() => marcarAsistencia(empleado.id, 'Falta')}
                  >Falta</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminarEmpleado(empleado.id)}
                    title="Eliminar empleado"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {empleadosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No hay empleados registrados. ¡Agrega uno nuevo!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App;
