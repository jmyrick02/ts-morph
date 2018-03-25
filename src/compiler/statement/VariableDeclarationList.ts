import {ts, SyntaxKind} from "../../typescript";
import {insertIntoParentTextRange, insertIntoCommaSeparatedNodes, getNodesToReturn} from "../../manipulation";
import * as errors from "../../errors";
import {Node} from "../common";
import {VariableDeclarationListStructure, VariableDeclarationStructure} from "../../structures";
import {VariableDeclarationStructureToText, CommaSeparatedStructuresToText} from "../../structureToTexts";
import {ModifierableNode} from "../base";
import {callBaseFill} from "../callBaseFill";
import {VariableDeclaration} from "./VariableDeclaration";
import {VariableDeclarationType} from "./VariableDeclarationType";

export const VariableDeclarationListBase = ModifierableNode(Node);
export class VariableDeclarationList extends VariableDeclarationListBase<ts.VariableDeclarationList> {
    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[] {
        return this.compilerNode.declarations.map(d => this.getNodeFromCompilerNode<VariableDeclaration>(d));
    }

    /**
     * Gets the variable declaration type.
     */
    getDeclarationType(): VariableDeclarationType {
        const nodeFlags = this.compilerNode.flags;

        if (nodeFlags & ts.NodeFlags.Let)
            return VariableDeclarationType.Let;
        else if (nodeFlags & ts.NodeFlags.Const)
            return VariableDeclarationType.Const;
        else
            return VariableDeclarationType.Var;
    }

    /**
     * Gets the variable declaration type keyword.
     */
    getDeclarationTypeKeyword(): Node {
        const declarationType = this.getDeclarationType();
        switch (declarationType) {
            case VariableDeclarationType.Const:
                return this.getFirstChildByKindOrThrow(SyntaxKind.ConstKeyword);
            case VariableDeclarationType.Let:
                return this.getFirstChildByKindOrThrow(SyntaxKind.LetKeyword);
            case VariableDeclarationType.Var:
                return this.getFirstChildByKindOrThrow(SyntaxKind.VarKeyword);
            default:
                throw errors.getNotImplementedForNeverValueError(declarationType);
        }
    }

    /**
     * Sets the variable declaration type.
     * @param type - Type to set.
     */
    setDeclarationType(type: VariableDeclarationType) {
        if (this.getDeclarationType() === type)
            return this;

        const keyword = this.getDeclarationTypeKeyword();
        insertIntoParentTextRange({
            insertPos: keyword.getStart(),
            newText: type,
            parent: this,
            replacing: {
                textLength: keyword.getWidth()
            }
        });

        return this;
    }

    /**
     * Add a variable declaration to the statement.
     * @param structure - Structure representing the variable declaration to add.
     */
    addDeclaration(structure: VariableDeclarationStructure) {
        return this.addDeclarations([structure])[0];
    }

    /**
     * Adds variable declarations to the statement.
     * @param structures - Structures representing the variable declarations to add.
     */
    addDeclarations(structures: VariableDeclarationStructure[]) {
        return this.insertDeclarations(this.getDeclarations().length, structures);
    }

    /**
     * Inserts a variable declaration at the specified index within the statement.
     * @param index - Index to insert.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: VariableDeclarationStructure) {
        return this.insertDeclarations(index, [structure])[0];
    }

    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Index to insert.
     * @param structures - Structures representing the variable declarations to insert.
     */
    insertDeclarations(index: number, structures: VariableDeclarationStructure[]) {
        const writer = this.getWriterWithQueuedChildIndentation();
        const structureToText = new CommaSeparatedStructuresToText(writer, new VariableDeclarationStructureToText(writer));

        structureToText.writeText(structures);

        insertIntoCommaSeparatedNodes({
            parent: this.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
            currentNodes: this.getDeclarations(),
            insertIndex: index,
            newText: writer.toString()
        });

        const declarations = getNodesToReturn(this.getDeclarations(), index, structures.length);

        for (let i = 0; i < structures.length; i++)
            declarations[i].fill(structures[i]);

        return declarations;
    }

    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableDeclarationListStructure>) {
        callBaseFill(VariableDeclarationListBase.prototype, this, structure);

        if (structure.declarationType != null)
            this.setDeclarationType(structure.declarationType);
        if (structure.declarations != null)
            this.addDeclarations(structure.declarations);

        return this;
    }
}
