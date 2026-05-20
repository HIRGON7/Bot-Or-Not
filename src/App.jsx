import { useRef, useState } from "react";
import "./App.css";
import Morph from "./component/morph.jsx";

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const infoRef = useRef(null);

  const prediction =
    analysisResult?.prediction ||
    analysisResult?.predicted_label ||
    analysisResult?.label ||
    analysisResult?.result;

  function formatPercent(value) {
    if (value === undefined || value === null) return null;

    const number = Number(value);

    if (Number.isNaN(number)) return null;

    if (number > 1) {
      return `${number.toFixed(2)}%`;
    }

    return `${(number * 100).toFixed(2)}%`;
  }

  function scrollToInfo() {
    infoRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="whole-page">
      <section className="the-morph">
        <Morph
          onResult={setAnalysisResult}
          onError={setAnalysisError}
          onLoading={setIsAnalyzing}
        />
      </section>

      <div
        className={`section-line ${isAnalyzing ? "is-loading" : ""}`}
        onClick={scrollToInfo}
      >
        <div className="loading-line">
          <span>{isAnalyzing ? "Analyzing text..." : "Scroll for full analysis"}</span>
        </div>
      </div>

      <section className="info-div" ref={infoRef}>
        <div className="info-header">
          <span>Analysis Result</span>
          <h2>DistilBERT Detection Details</h2>
          <p>
            The morphing sphere shows the final answer above. This section shows
            the full backend response: prediction, probabilities, tokenizer
            details, and linguistic analysis.
          </p>
        </div>

        {analysisError && <div className="error-card">{analysisError}</div>}

        {!analysisResult && !analysisError && (
          <div className="empty-card">
            Write text above, press Create, then scroll here to see the full analysis.
          </div>
        )}

        {analysisResult && (
          <div className="result-grid">
            <div className="result-card big-card">
              <h3>Prediction</h3>
              <h1>{prediction?.toUpperCase()}</h1>
            </div>

            {analysisResult.confidence !== undefined && (
              <div className="result-card">
                <h3>Confidence</h3>
                <p>{formatPercent(analysisResult.confidence)}</p>
              </div>
            )}

            {analysisResult.ai_probability !== undefined && (
              <div className="result-card">
                <h3>AI Probability</h3>
                <p>{formatPercent(analysisResult.ai_probability)}</p>
              </div>
            )}

            {analysisResult.human_probability !== undefined && (
              <div className="result-card">
                <h3>Human Probability</h3>
                <p>{formatPercent(analysisResult.human_probability)}</p>
              </div>
            )}

            {analysisResult.token_count !== undefined && (
              <div className="result-card">
                <h3>Token Count</h3>
                <p>{analysisResult.token_count}</p>
              </div>
            )}

            {analysisResult.explanation && (
              <div className="result-card wide-card">
                <h3>Explanation</h3>
                <p>{analysisResult.explanation}</p>
              </div>
            )}

            {analysisResult.linguistic_analysis && (
              <div className="result-card wide-card">
                <h3>Linguistic Analysis</h3>

                {analysisResult.linguistic_analysis.sentence_count !== undefined && (
                  <p>Sentences: {analysisResult.linguistic_analysis.sentence_count}</p>
                )}

                {analysisResult.linguistic_analysis.word_count !== undefined && (
                  <p>Words: {analysisResult.linguistic_analysis.word_count}</p>
                )}

                {analysisResult.linguistic_analysis.unique_word_count !== undefined && (
                  <p>
                    Unique Words:{" "}
                    {analysisResult.linguistic_analysis.unique_word_count}
                  </p>
                )}
              </div>
            )}

            {Array.isArray(analysisResult.tokens) && (
              <div className="result-card wide-card">
                <h3>Tokens</h3>
                <div className="token-list">
                  {analysisResult.tokens.slice(0, 100).map((token, index) => (
                    <span key={index}>{token}</span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(analysisResult.top_tokens) && (
              <div className="result-card wide-card">
                <h3>Top Tokens</h3>
                <div className="token-list">
                  {analysisResult.top_tokens.slice(0, 60).map((item, index) => (
                    <span key={index}>
                      {typeof item === "string" ? item : item.token}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;