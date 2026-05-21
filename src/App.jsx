import { useRef, useState } from "react";
import "./App.css";
import Morph from "./component/morph.jsx";

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const infoSectionRef = useRef(null);

  let prediction = "";

  if (analysisResult) {
    prediction = analysisResult.prediction;
  }

  let sectionLineClass = "section-line";

  if (isAnalyzing) {
    sectionLineClass = "section-line is-loading";
  }

  let loadingText = "Scroll for full analysis";

  if (isAnalyzing) {
    loadingText = "Analyzing text...";
  }

  function formatPercent(value) {
    if (value === undefined || value === null) {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return null;
    }

    if (number > 1) {
      return `${number.toFixed(2)}%`;
    }

    return `${(number * 100).toFixed(2)}%`;
  }

  function scrollToInfoSection() {
    if (infoSectionRef.current) {
      infoSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function getTokenText(item) {
    if (typeof item === "string") {
      return item;
    }

    return item.token;
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

      <div className={sectionLineClass} onClick={scrollToInfoSection}>
        <div className="loading-line">
          <span>{loadingText}</span>
        </div>
      </div>

      <section className="info-div" ref={infoSectionRef}>
        <div className="info-header">
          <span>Analysis Result</span>

          <h2>DistilBERT Detection Details</h2>

          <p>
            The Futuristic morphing sphere decides whether the text is Ai or Human above. This section explains
            the futuristic Futuristic morphing sphere's response: prediction, probabilities, tokenizer
            details, and linguistic analysis.
          </p>
        </div>

        {analysisError && (
          <div className="error-card">
            {analysisError}
          </div>
        )}

        {!analysisResult && !analysisError && (
          <div className="empty-card">
            Write text above, press Create, then scroll here to see the full
            analysis.
          </div>
        )}

        {analysisResult && (
          <div className="result-grid">
            <div className="result-card big-card">
              <h3>Prediction</h3>
              <h1>{prediction.toUpperCase()}</h1>
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
                  <p>
                    Sentences:{" "}
                    {analysisResult.linguistic_analysis.sentence_count}
                  </p>
                )}

                {analysisResult.linguistic_analysis.word_count !== undefined && (
                  <p>
                    Words: {analysisResult.linguistic_analysis.word_count}
                  </p>
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
                    <span key={index}>{getTokenText(item)}</span>
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
