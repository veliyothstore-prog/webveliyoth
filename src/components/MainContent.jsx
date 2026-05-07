import CategorySidebar from './CategorySidebar';
import ProductGrid from './ProductGrid';
import PromoCarousel from './PromoCarousel';

const MainContent = () => {
  return (
    <section id="catalogo" className="container" style={{ paddingBottom: '5rem' }}>
      <div className="main-layout">
        <div className="sidebar-left">
          <CategorySidebar />
        </div>

        <div className="content-center">
          <ProductGrid />
        </div>
        
        <div className="content-right">
          <PromoCarousel />
        </div>
      </div>

      <style>{`
        .main-layout {
          display: grid;
          grid-template-columns: 260px 1fr 320px;
          gap: 3rem;
          align-items: start;
          width: 100%;
        }
        @media (max-width: 1200px) {
          .main-layout {
            grid-template-columns: 240px 1fr;
            gap: 2rem;
          }
          .content-right {
            grid-column: span 2;
            margin-top: 2rem;
          }
        }
        @media (max-width: 900px) {
          .main-layout {
            grid-template-columns: 100% !important;
            display: block !important;
            gap: 0;
            width: 100% !important;
            overflow: hidden;
          }
          .sidebar-left, .content-center, .content-right {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 0 2rem 0 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default MainContent;
