import { useState, useEffect } from "react";

function App(){

  const estadoInicial = [
    {id: 1, nombre: 'Ana García', puesto: 'Desarrolladora Frontend', estado: 'pendiente'},
    {id: 2, nombre: 'Carlos López', puesto: 'Diseñador UX/UI', estado: 'pendiente'},
    {id: 3, nombre: 'María Rodríguez', puesto: 'Project Manager', estado: 'pendiente'},
    {id: 4, nombre: 'Jorge Pérez', puesto: 'Desarrollador Backend', estado: 'pendiente'}
  ];

  const [empleados, setEmpleados] = useState(() => {
    const datosGuardados = localStorage.getItem('empleadosGuardados')

    if(datosGuardados){
      return JSON.parse(datosGuardados);
    }

    return estadoInicial;
  });

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPuesto, setNuevoPuesto] = useState('');

  useEffect(() => {
    localStorage.setItem('empleadosGuardados', JSON.stringify(empleados));
  }, [empleados]);
  
  const marcarAsistencia = (id, nuevoEstado) => {
    const empleadosActualizados = empleados.map((empleado) => {
      if(empleado.id === id){
        return {...empleado, estado: nuevoEstado};
      }
      return empleado;
    });
    setEmpleados(empleadosActualizados);
  }

  const obtenerColorBadge = (estado) => {
    if(estado === 'Presente') return 'bg-success';
    if(estado === 'Tarde') return 'bg-warning text-dark';
    if(estado === 'Falta') return 'bg-danger';
    return 'bg-secondary';
  }

  const agregarEmpleado = (e) => {
    e.preventDefault();

    if(nuevoNombre.trim() === '' || nuevoPuesto.trim() === '') return;

    const nuevoEmpleado = {
      id: empleados.length > 0 ? Math.max(...empleados.map(emp => emp.id)) + 1 : 1,
      nombre: nuevoNombre,
      puesto: nuevoPuesto,
      estado: 'Pendiente'
    };
    setEmpleados([...empleados, nuevoEmpleado]);
    setNuevoNombre('');
    setNuevoPuesto('');
  }

  const eliminarEmpleado = (id) => {
    const listaActualizada = empleados.filter((empleado) => empleado.id !== id);
    setEmpleados(listaActualizada);
  }

  const totalEmpleados = empleados.length;
  const totalPresentes = empleados.filter(emp => emp.estado === 'Presente').length;
  const totalTardes = empleados.filter(emp => emp.estado === 'Tarde').length;
  const totalFaltas = empleados.filter(emp => emp.estado === 'Falta').length;
  
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
            {empleados.map((empleado, index) => (
              <tr key={empleado.id}>
                <td className="fw-bold text-secondary">{index + 1}</td>
                <td className="fw-bold">{empleado.nombre}</td>
                <td>{empleado.puesto}</td>
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
            {empleados.length === 0 && (
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
