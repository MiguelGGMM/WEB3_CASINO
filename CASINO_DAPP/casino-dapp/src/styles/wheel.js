import styled from "styled-components";

export const FormContainer = styled("div")({
    display: "flex",
    flexDirection: "column",
    "@media (max-width: 768px)": {
        padding: 20,
    },
});

export const ButtonAction = styled("a")({
    width: '100%',
    textAlign: 'center',
    padding: "16px 40px",
    color: "#000000",
    fontWeight: 800,
    /* background: (props) =>
        `linear-gradient(90deg, white 0%, ${props.secondaryColor ? props.secondaryColor : "black"
        } 100%);`, */
    background: `#ffffff`,
    borderRadius: 10,
    letterSpacing: "3px",
    cursor: "pointer",
    transition: 'all 0.1s ease-in',
    webkitTransition: 'all 0.1s ease-in',
    cursor: 'pointer',
    "&:hover": {
        color: '#000000',
    },
    fontSize: 16
});

export const InputAmount = styled("input")({
    backgroundColor: "#FFD700",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    padding: "15px 15px",
    borderRadius: 10,
    outline: 'none'
});
