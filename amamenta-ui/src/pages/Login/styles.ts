import styled from "styled-components";

export const LoginPage = styled.div`
    display: flex;
    height: 90vh;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .card-content{
        padding: 20px;
    }

    form {
        display: flex;
        flex-direction: column;
    }
`;

export const CardContent = styled.div`
    width: 344px;
    align-items: flex-end;

    h3{
        margin-top: 0;
    }

    .input-label{
        margin-top: 20px;
    }

    .br-button.primary{
        align-self: flex-end;
        margin-top: 20px;
    }

    .input-group{
        position: relative;
    }

    .input-group input{
        padding-right: 48px;
    }
`;

export const VisibilityButton = styled.span<{ $errorVisible: boolean }>`
    position: absolute;
    right: 12px;
    top: ${({ $errorVisible }) => ($errorVisible ? "30%" : "50%")};
    transform: translateY(-50%);

    display: flex;
    align-items: center;
    justify-content: center;

    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 10;
`;