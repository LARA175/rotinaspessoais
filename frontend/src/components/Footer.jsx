// Rodapé com informações do projeto acadêmico e instituição.
import React from 'react'

function Footer() {
  return (
    <footer className="mt-auto" style={{ background: '#f5efdd', borderTop: '2px solid #d5dcc0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
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
