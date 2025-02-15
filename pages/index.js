import { useState, useEffect } from 'react';
import axios from 'axios';
import OpenAI from 'openai'; // Importe o SDK do OpenAI
import MobileSearch from './MobileSearch';

// Configuração do cliente OpenAI (DeepSeek)
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-93980c6457614d3ba3b59d456ab0a5ba', // Sua API Key do DeepSeek
});

export default function Home() {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('relevance');
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [maxAge, setMaxAge] = useState(0); // Novo estado para filtro de tempo
    const [isLoading, setIsLoading] = useState(false); // Estado para carregamento
    const [assistantResponse, setAssistantResponse] = useState(''); // Resposta do assistente

    const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    // Função para buscar produtos no Mercado Livre
    const handleSearch = async (page = 1) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * 10;
            const response = await axios.get('/api/search', {
                params: { 
                    query, 
                    sort, 
                    offset,
                    maxAge,
                },
            });

            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
            setError('');
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setError('Erro ao buscar produtos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Função para consultar o assistente (DeepSeek Chat)
    const consultAssistant = async () => {
        setIsLoading(true);
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "Você é um assistente útil que ajuda a refinar pesquisas de produtos no Mercado Livre." },
                    { role: "user", content: `Me ajude a encontrar produtos no Mercado Livre com base na pesquisa "${query}". Sugira termos de busca ou categorias como mais vendidos, menos vendidos, menor preço, etc.` },
                ],
                model: "deepseek-chat",
            });

            // Define a resposta do assistente
            setAssistantResponse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Erro ao consultar o assistente:', error);
            setError('Erro ao consultar o assistente. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Função para calcular dias desde a criação
    const daysSinceCreation = (dateString) => {
        const createdDate = new Date(dateString);
        const today = new Date();
        return Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="container">
            <header>
                <h1>Buscador de Produtos do Mercado Livre</h1>
            </header>

            {isMobile ? (
                <MobileSearch 
                    handleSearch={handleSearch} 
                    query={query} 
                    setQuery={setQuery} 
                    sort={sort} 
                    setSort={setSort}
                    maxAge={maxAge}
                    setMaxAge={setMaxAge}
                />
            ) : (
                <div className="desktop-search">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                        <input
                            type="text"
                            placeholder="Digite o nome do produto"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="relevance">Mais Vendidos</option>
                            <option value="sold_asc">Menos Vendidos</option>
                            <option value="price_asc">Menor Preço</option>
                            <option value="price_desc">Maior Preço</option>
                        </select>
                        <div className="age-filter">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={maxAge === 90}
                                    onChange={(e) => setMaxAge(e.target.checked ? 90 : 0)}
                                />
                                Menos de 90 dias
                            </label>
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Buscando...' : 'Buscar'}
                        </button>
                        <button
                            type="button"
                            onClick={consultAssistant}
                            disabled={isLoading}
                            className="assistant-button"
                        >
                            Consultar Assistente
                        </button>
                    </form>
                </div>
            )}

            {error && <div className="error">{error}</div>}

            {/* Resposta do Assistente */}
            {assistantResponse && (
                <div className="assistant-response">
                    <h3>Sugestão do Assistente:</h3>
                    <p>{assistantResponse}</p>
                </div>
            )}

            <div className="results">
                <ul>
                    {products
                        .filter(product => daysSinceCreation(product.dateCreated) < maxAge || maxAge === 0)
                        .map((product, index) => (
                            <li key={index} className="product">
                                <div className="image-carousel">
                                    <button className="carousel-button left" onClick={() => {
                                        const carousel = document.querySelector(`#carousel-${index}`);
                                        carousel.scrollLeft -= carousel.offsetWidth;
                                    }}>
                                        &lt;
                                    </button>
                                    <div className="image-wrapper" id={`carousel-${index}`}>
                                        {product.images.map((img, idx) => (
                                            <div className="image-container" key={idx}>
                                                <img 
                                                    src={img} 
                                                    alt={`Imagem ${idx + 1} de ${product.title}`} 
                                                    className="product-image"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="carousel-button right" onClick={() => {
                                        const carousel = document.querySelector(`#carousel-${index}`);
                                        carousel.scrollLeft += carousel.offsetWidth;
                                    }}>
                                        &gt;
                                    </button>
                                </div>
                                <div className="product-info">
                                    <h3>{product.title}</h3>
                                    <p className="product-price">R$ {product.price}</p>
                                    <p>Quantidade Vendida: {product.soldQuantity}</p>
                                    <p>Criado em: {product.dateCreated}</p>
                                    <p>Última Atualização: {product.lastUpdated}</p>
                                    <a href={product.link} target="_blank" rel="noopener noreferrer">
                                        Ver Produto
                                    </a>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>

            <div className="pagination">
                {currentPage > 1 && (
                    <button onClick={() => handleSearch(currentPage - 1)}>
                        Página Anterior
                    </button>
                )}
                <span>Página {currentPage} de {totalPages}</span>
                {currentPage < totalPages && (
                    <button onClick={() => handleSearch(currentPage + 1)}>
                        Próxima Página
                    </button>
                )}
            </div>

            <style jsx>{`
                .container {
                    padding: 20px;
                }
                header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #e0e0e0;
                    margin: 0;
                }
                .desktop-search {
                    margin-bottom: 20px;
                }
                .desktop-search form {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    justify-content: center;
                }
                .desktop-search input {
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid #555;
                    background: #333;
                    color: white;
                }
                .desktop-search select {
                    padding: 8px;
                    border-radius: 4px;
                    background: #333;
                    color: white;
                    border: 1px solid #555;
                }
                .desktop-search button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    background: #00e5ff;
                    color: black;
                    border: none;
                    cursor: pointer;
                }
                .desktop-search .assistant-button {
                    background: #ffcc00;
                    color: black;
                }
                .age-filter {
                    margin: 10px 0;
                    color: #e0e0e0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .age-filter input {
                    margin-right: 5px;
                }
                .results {
                    margin-top: 20px;
                }
                .results ul {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }
                .product {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 15px;
                    width: 220px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                }
                .image-carousel {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                .image-wrapper {
                    display: flex;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                }
                .image-wrapper::-webkit-scrollbar {
                    display: none;
                }
                .image-container {
                    flex: 0 0 auto;
                    width: 200px;
                    height: 200px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #f0f0f0;
                    border-radius: 8px;
                    margin-right: 10px;
                }
                .product-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
                }
                .carousel-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.5);
                    border: none;
                    cursor: pointer;
                    font-size: 20px;
                    color: #333;
                    z-index: 10;
                    padding: 10px;
                    border-radius: 50%;
                }
                .carousel-button.left {
                    left: 10px;
                }
                .carousel-button.right {
                    right: 10px;
                }
                .product-info {
                    text-align: center;
                    color: #e0e0e0;
                }
                .product-price {
                    font-weight: bold;
                    color: #00e5ff;
                    margin-top: 10px;
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 20px 0;
                }
                .pagination span {
                    margin: 0 10px;
                    color: #e0e0e0;
                }
                .pagination button {
                    padding: 8px 16px;
                    border-radius: 4px;
                    background: #00e5ff;
                    color: black;
                    border: none;
                    cursor: pointer;
                }
                .assistant-response {
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #e0e0e0;
                }
                .assistant-response h3 {
                    margin-top: 0;
                }
            `}</style>
        </div>
    );
}
