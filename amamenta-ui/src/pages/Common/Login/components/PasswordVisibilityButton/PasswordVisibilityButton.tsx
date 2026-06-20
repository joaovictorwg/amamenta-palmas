import { Icon } from "@govbr-ds/react-components";

interface PasswordVisibilityProps {
    visibility: boolean;
    setVisibility: (value: boolean) => void
}

export default function PasswordVisibilityButton(props: PasswordVisibilityProps) {
    const { visibility, setVisibility } = props

    return (
        <span
            style={{ cursor: "pointer" }}
            onClick={() => setVisibility(!visibility)}
        >
            {visibility
                ? <Icon icon="eye-slash" />
                : <Icon icon="eye" />
            }
        </span>
    );
}