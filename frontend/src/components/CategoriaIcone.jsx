// Catálogo de ícones das categorias (chaves em português) + presets prontos.
// Uso: <CategoriaIcone icone="livro" cor="#5f7f52" tamanho={18} />
import React from 'react'
import {
  FiBookOpen, FiBriefcase, FiHome, FiHeart, FiShoppingCart, FiMusic,
  FiCamera, FiPenTool, FiClock, FiCalendar, FiStar, FiMoon, FiSun,
  FiGift, FiMap, FiDollarSign, FiActivity, FiCoffee, FiTag,
} from 'react-icons/fi'
import { FaGamepad, FaUtensils, FaBicycle, FaPlane, FaPaw, FaPalette, FaDumbbell } from 'react-icons/fa'
import { GiSoccerBall, GiFlowerEmblem } from 'react-icons/gi'

export const CATALOGO_ICONES = [
  { chave: 'livro', rotulo: 'Livro', Icone: FiBookOpen },
  { chave: 'maleta', rotulo: 'Maleta', Icone: FiBriefcase },
  { chave: 'casa', rotulo: 'Casa', Icone: FiHome },
  { chave: 'coracao', rotulo: 'Coração', Icone: FiHeart },
  { chave: 'futebol', rotulo: 'Futebol', Icone: GiSoccerBall },
  { chave: 'flor', rotulo: 'Flor', Icone: GiFlowerEmblem },
  { chave: 'compras', rotulo: 'Compras', Icone: FiShoppingCart },
  { chave: 'dinheiro', rotulo: 'Dinheiro', Icone: FiDollarSign },
  { chave: 'comida', rotulo: 'Comida', Icone: FaUtensils },
  { chave: 'cafe', rotulo: 'Café', Icone: FiCoffee },
  { chave: 'musica', rotulo: 'Música', Icone: FiMusic },
  { chave: 'jogo', rotulo: 'Jogo', Icone: FaGamepad },
  { chave: 'camera', rotulo: 'Câmera', Icone: FiCamera },
  { chave: 'arte', rotulo: 'Arte', Icone: FaPalette },
  { chave: 'academia', rotulo: 'Academia', Icone: FaDumbbell },
  { chave: 'bicicleta', rotulo: 'Bicicleta', Icone: FaBicycle },
  { chave: 'viagem', rotulo: 'Viagem', Icone: FaPlane },
  { chave: 'pet', rotulo: 'Pet', Icone: FaPaw },
  { chave: 'mapa', rotulo: 'Mapa', Icone: FiMap },
  { chave: 'atividade', rotulo: 'Saúde', Icone: FiActivity },
  { chave: 'caneta', rotulo: 'Caneta', Icone: FiPenTool },
  { chave: 'lua', rotulo: 'Noite', Icone: FiMoon },
  { chave: 'sol', rotulo: 'Dia', Icone: FiSun },
  { chave: 'estrela', rotulo: 'Estrela', Icone: FiStar },
  { chave: 'presente', rotulo: 'Presente', Icone: FiGift },
  { chave: 'relogio', rotulo: 'Relógio', Icone: FiClock },
  { chave: 'calendario', rotulo: 'Calendário', Icone: FiCalendar },
]

export const MAPA_ICONE = Object.fromEntries(
  CATALOGO_ICONES.map(({ chave, Icone }) => [chave, Icone])
)

// Rótulo em português a partir da chave (ex: 'livro' → 'Livro')
export function rotuloIcone(chave) {
  const item = CATALOGO_ICONES.find((i) => i.chave === chave)
  return item ? item.rotulo : 'Personalizado'
}

// Sugestões prontas ao criar categoria: nome + cor + ícone combinando
export const PRESETS_CATEGORIAS = [
  { nome: 'Estudos', cor: '#5f7f52', icone: 'livro' },
  { nome: 'Trabalho', cor: '#47633c', icone: 'maleta' },
  { nome: 'Casa', cor: '#b08945', icone: 'casa' },
  { nome: 'Saúde', cor: '#b0563e', icone: 'coracao' },
  { nome: 'Esporte', cor: '#7a9e7e', icone: 'futebol' },
  { nome: 'Compras', cor: '#c4a265', icone: 'compras' },
  { nome: 'Lazer', cor: '#8aaa7b', icone: 'jogo' },
  { nome: 'Natureza', cor: '#a9bfa0', icone: 'flor' },
]

function CategoriaIcone({ icone, cor = '#5f7f52', tamanho = 18, className = '' }) {
  const Icone = MAPA_ICONE[icone] || FiTag
  return <Icone size={tamanho} color={cor} className={className} style={{ flexShrink: 0 }} />
}

export default CategoriaIcone
