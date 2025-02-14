import { Dynamic } from "solid-js/web";

import { browserSdk } from "~/components/parameter/__generated__/index.ts";
import { ParameterHover } from "~/components/parameter/ParameterHover.tsx";

interface SDKParameterProps {
  path: keyof typeof browserSdk;
  ident?: string;
  optional?: boolean;
  inline?: boolean;
}

export function SDKParameter(props: SDKParameterProps) {
  // const option = createMemo(() => {
  //   if (props.mode === undefined || props.mode === "full") {
  //     return "typeDef";
  //   }
  //   return "type";
  // });

  return (
    <Dynamic
      component={browserSdk[props.path].typeDef}
      ident={props.ident}
      optional={props.optional}
    />
  );
}

export function SDKParameterRef(props: SDKParameterProps) {
  return <ParameterHover content={<SDKParameter {...props} inline />} />;
}
