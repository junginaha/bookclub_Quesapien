import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import "@/components/bookclub/bookclub.css";

export default function Loading() {
  return (
    <div className="qc-page">
      <Header />
      <main>
        <div className="qc-cover qc-skel" />
        <div className="qc-body">
          <div className="qc-sidebar">
            <div className="qc-skel" style={{ height: 120 }} />
            <div className="qc-skel" style={{ height: 64 }} />
            <div className="qc-skel" style={{ height: 44 }} />
          </div>
          <div className="qc-main">
            <div className="qc-skel" style={{ height: 280, marginBottom: 24 }} />
            <div className="qc-skel" style={{ height: 36, width: 200, marginBottom: 20 }} />
            <div className="qc-skel" style={{ height: 96, marginBottom: 16 }} />
            <div className="qc-skel" style={{ height: 96, marginBottom: 16 }} />
            <div className="qc-skel" style={{ height: 96 }} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
