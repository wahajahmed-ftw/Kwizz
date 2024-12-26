// src/components/Cards.js
import React from "react";
import "../css/card.css";
import Header from "./header";
const Cards = () => {
  const cardsData = [
    {
      title: "For Businesses & Professionals",
      description: "Host engaging year-end events with Kahoot! 360.",
      offer: "Save over $50 on Kahoot! 360 from $25/month until December 18.",
      buttonText: "Buy now",
      learnMoreLink: "#",
      img: "/img/class1.jpg",
    },
    {
      title: "Kahoot+ for Teachers",
      description: "Make classroom sessions more engaging.",
      offer: "Save up to 50% on Kahoot+ from $3.99/month until December 18.",
      buttonText: "Buy now",
      learnMoreLink: "#",
      img: "/img/class1.jpg",

    },
    {
      title: "Kahoot+ for Students",
      description: "Ace exams this holiday season with Kahoot+.",
      offer: "Save up to 20% on Kahoot+ this festive season.",
      buttonText: "Buy now",
      learnMoreLink: "#",
      img: "/img/class1.jpg",

    },
    {
      title: "For Family & Friends",
      description: "Host festive get-togethers with Kahoot+.",
      offer: "Save up to 20% on Kahoot+ this festive season.",
      buttonText: "Buy now",
      learnMoreLink: "#",
      img: "/img/class1.jpg",

    },
    {
      title: "Kahoot+ for Teachers",
      description: "Make classroom sessions more engaging.",
      offer: "Save up to 50% on Kahoot+ from $3.99/month until December 18.",
      buttonText: "Buy now",
      learnMoreLink: "#",
      img: "/img/class1.jpg",

    },
    {
      title: "Kahoot+ for Teachers",
      description: "Make classroom sessions more engaging.",
      offer: "Save up to 50% on Kahoot+ from $3.99/month until December 18.",
      buttonText: "Buy now",
      learnMoreLink: "#",
      img: "/img/class1.jpg",

    },
    
    
   
  ];

  return (
    <div>

      <Header />
    <div className="cards-container">
      {cardsData.map((card, index) => (
        <div key={index} className="card">
          <img src={card.img} alt="Kahoot!" />
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <p className="offer">{card.offer}</p>
          <br></br>
          <button className="btn-grad">{card.buttonText}</button>
          <br></br><br></br>
          <a href={card.learnMoreLink} className="learn-more">
            Learn more
          </a>
        </div>
      ))}
    </div>
      </div>
  );
};

export default Cards;
