import React from 'react';

export const AsyncStateWrapper = ({ status, loadingComponent, errorComponent, children, error }) => {
  if (status === 'LOADING') {
    return loadingComponent || (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        <span className="ml-3 text-gray-300">Cargando Ensamblia...</span>
      </div>
    );
  }

  if (status === 'ERROR') {
    return errorComponent || (
      <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 my-4 text-center">
        <p className="font-semibold">Ha ocurrido un error al cargar los datos</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return <>{children}</>;
  }

  return null; 
};