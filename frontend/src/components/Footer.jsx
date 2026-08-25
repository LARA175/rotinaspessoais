import React from 'react'

function Footer() {
  return (
    <footer className="bg-slate-900/80 backdrop-blur border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-slate-400">
          <p>
            <strong>Rotinas Pessoais</strong> - Projeto Acadêmico
          </p>
          <p className="mt-1">
            Desenvolvido por João Eduardo Sousa Ferreira e Lara Ohana Rodrigues Galvão
          </p>
          <p className="mt-1 text-xs">
            Instituto Federal de Educação, Ciência e Tecnologia de Mato Grosso (IFMT) - Campus Barra do Garças
            <br />
            Orientador: Prof. Carlos David Rocha de Souza | Disciplina: Desenvolvimento Web
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
